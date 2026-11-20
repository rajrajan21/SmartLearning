# SharpStudy Activity Hub and mobile update

## Plan

1. Update Activity Hub with the approved logo, Menu, chapter search and View Classroom order. The expanded tabs stay in one row and scroll sideways when needed.
2. Add Classroom lesson search and Board, Class and Subject filters, with a live match count and a clear button.
3. Bring the SharpStudy logo, chapter search, navigation and an Install app action into the shared phone app shell. Existing bottom tabs and page-specific journeys remain available.
4. Use the existing web app manifest and install prompt. Android and other browsers with a native prompt can open it. On iPhone and iPad, use Safari's Add to Home Screen steps. Other browsers get install or bookmark instructions. The automatic prompt continues to respect the Admin install and reminder settings.

## Apply

Extract this ZIP and run Apply-SharpStudy-Mobile.bat. It defaults to D:\Smart Learning Website. To use a different checkout, pass its folder as the first argument. The pack expects the checkout that already contains Activity Hub and the layout gallery. It checks the patch before changing files and leaves your Git index alone.

## Verify and deploy

- Open Activity Hub in the site's gallery or on the local site. Toggle Menu, check that search remains visible and try the tabs at desktop and phone widths.
- Open /classroom and try Class 6 plus Science and a query such as magnet. Check Clear filters and open a matching lesson.
- On an Android phone, choose Install app and launch the shortcut. On an iPhone in Safari, follow the Add to Home Screen steps. Verify the logo, menus and lesson controls in both browsing and installed modes.
- Review and publish the chosen source changes, then deploy the code. The pack does not edit audio, the audio manifest or the job logs. Go-Live's publish step stages the entire checkout, so separate any ongoing audio changes before using it.
