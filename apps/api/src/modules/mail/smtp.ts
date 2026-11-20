import net from "node:net";
import tls from "node:tls";

export interface SmtpConfig { host: string; port: number; user: string; pass: string; from: string; secure: "ssl" | "starttls" }
export interface Mail { to: string; subject: string; text: string }

/** Cleans a header value so nobody can smuggle extra headers in. */
export const oneLine = (s: string): string => s.replace(/[\r\n]+/g, " ").trim();
/** Dot-stuffs the body and uses CRLF line ends as SMTP needs. */
export const bodyOf = (t: string): string => t.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
const b64 = (s: string): string => Buffer.from(s, "utf8").toString("base64");
/** UTF-8 safe subject. */
export const subjectOf = (s: string): string => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);

export function buildMessage(cfg: SmtpConfig, m: Mail): string {
  const head = [`From: ${oneLine(cfg.from)}`, `To: ${oneLine(m.to)}`, `Subject: ${subjectOf(oneLine(m.subject))}`, `Date: ${new Date().toUTCString()}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64"].join("\r\n");
  const body = (b64(m.text).match(/.{1,76}/g) ?? []).join("\r\n");
  return `${head}\r\n\r\n${body}`;
}

/** The mail address inside "Name <a@b.c>" or a bare address. */
export const addrOf = (s: string): string => (/<([^>]+)>/.exec(s)?.[1] ?? s).trim();

/** A very small SMTP client (AUTH LOGIN/PLAIN, SSL or STARTTLS). No outside packages; the mail service is whatever the admin enters. */
export function sendMail(cfg: SmtpConfig, m: Mail, timeoutMs = 20000): Promise<void> {
  return new Promise((resolve, reject) => {
    let sock: net.Socket | tls.TLSSocket;
    let buf = "";
    let waiter: ((code: number, text: string) => void) | null = null;
    let done = false;
    const fail = (e: unknown) => { if (done) return; done = true; try { sock.destroy(); } catch { /* ignore */ } reject(e instanceof Error ? e : new Error(String(e))); };
    const timer = setTimeout(() => fail(new Error("The mail server did not answer in time.")), timeoutMs);
    const finish = () => { if (done) return; done = true; clearTimeout(timer); try { sock.end(); } catch { /* ignore */ } resolve(); };
    const feed = (d: Buffer) => {
      buf += d.toString("utf8");
      for (;;) {
        const lines = buf.split("\r\n");
        // a reply is complete when a line looks like "250 text" (space after the code)
        const idx = lines.findIndex((l) => /^\d{3} /.test(l));
        if (idx < 0) return;
        const reply = lines.slice(0, idx + 1);
        buf = lines.slice(idx + 1).join("\r\n");
        const code = Number(reply[idx]!.slice(0, 3));
        const w = waiter; waiter = null;
        if (w) w(code, reply.join("\n"));
      }
    };
    const wait = (): Promise<{ code: number; text: string }> => new Promise((res) => { waiter = (code, text) => res({ code, text }); });
    const send = (line: string) => { sock.write(line + "\r\n"); };
    const expect = async (ok: number[], what: string) => { const r = await wait(); if (!ok.includes(r.code)) throw new Error(`${what}: ${r.text.slice(0, 160)}`); return r; };
    const attach = (s: net.Socket | tls.TLSSocket) => { sock = s; s.on("data", feed); s.on("error", fail); s.on("close", () => { if (!done) fail(new Error("The mail server closed the connection.")); }); };
    const run = async () => {
      await expect([220], "Greeting");
      send("EHLO sharpstudy.in"); await expect([250], "EHLO");
      if (cfg.secure === "starttls") {
        send("STARTTLS"); await expect([220], "STARTTLS");
        const plain = sock as net.Socket; plain.removeAllListeners("data"); plain.removeAllListeners("close"); plain.removeAllListeners("error");
        const t = tls.connect({ socket: plain, servername: cfg.host });
        await new Promise<void>((res, rej) => { t.once("secureConnect", () => res()); t.once("error", rej); });
        attach(t);
        send("EHLO sharpstudy.in"); await expect([250], "EHLO");
      }
      if (cfg.user) {
        send("AUTH LOGIN"); await expect([334], "AUTH");
        send(b64(cfg.user)); await expect([334], "User name");
        send(b64(cfg.pass)); await expect([235], "Sign-in (check the user name and key)");
      }
      send(`MAIL FROM:<${addrOf(cfg.from)}>`); await expect([250], "Sender");
      send(`RCPT TO:<${addrOf(m.to)}>`); await expect([250, 251], "Recipient");
      send("DATA"); await expect([354], "DATA");
      send(bodyOf(buildMessage(cfg, m)) + "\r\n."); await expect([250], "Sending");
      send("QUIT");
    };
    const go = () => { run().then(finish, fail); };
    if (cfg.secure === "ssl") { const s = tls.connect({ host: cfg.host, port: cfg.port, servername: cfg.host }); attach(s); s.once("secureConnect", go); }
    else { const s = net.connect({ host: cfg.host, port: cfg.port }); attach(s); go(); }
  });
}
