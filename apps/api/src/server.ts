import { createApp } from "./app.js";
import { createMemoryCurriculumRepository } from "./modules/curriculum/memory-repository.js";

const port = Number(process.env.PORT ?? 3000);
const app = createApp({ curriculum: createMemoryCurriculumRepository() });
app.listen(port, () => console.log(`StudySmart API listening on :${port}`));
