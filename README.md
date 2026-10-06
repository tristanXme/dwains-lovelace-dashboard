# dwains-lovelace-dashboard

## Important Announcement

Update June 2026

Dwains Dashboard 3.10.1 has been released, and the DD3 source files are now available in this repository. See below for 3.11.0.

DD3 is no longer under active feature development and will slowly be phased out. Existing older issues have been closed as part of a tracker cleanup. If you still experience a bug on DD3, please retest with the latest DD3 version first and open a new issue only when it is still reproducible.

Active development continues in Dwains Dashboard Next:

https://github.com/dwainscheeren/dwains-dashboard-next

At the time of writing, Dwains Dashboard Next is still in alpha. Feature requests should be considered for Dwains Dashboard Next instead of DD 3.*

I built Dwains Dashboard as a free, open-source project in my spare time alongside my job. I remain proud of what we built together and grateful for everyone who reported bugs, requested features, and helped improve Dwains Dashboard over the years.

— Dwain


## Dwains Dashboard 3.11.0

Security, stability and performance release of DD3.

- **Security:** file names sent by the dashboard editor are validated (no more
  `../` paths), more-page names can no longer break the dashboard or reveal
  `secrets.yaml` values, dashboard templates run in a Jinja sandbox.
  `!include` and Jinja includes only read files inside the dashboard folders
  (`dwains-dashboard/` without its backups, `hki-user/` and the bundled
  views).
- **Changed: `!secret` is no longer supported in dashboard files.** Every
  value in the dashboard is visible to every user who can open it, so a
  secret resolved there was not secret anymore. A dashboard file that still
  uses `!secret` does not load; the error names the file and the secret. Put
  the value into the file itself or leave it out.
- **Stability:** removed or unavailable entities (favorites, alarm, weather) no
  longer break the homepage; blueprint input fields work again on Home
  Assistant 2026.9+; clear error messages instead of `unknown_error`.
- **Performance:**
  - The main bundle shrank from 584 KB in 3.10.1 to about 360 KB (82 KB
    gzip-compressed).
    Edit dialogs, drag and drop and the strings of other languages load only
    when needed; the strings of your language arrive before the first render.
    A tab left open across an update asks to be reloaded when it cannot load
    these parts anymore, and switching the language keeps the previous one
    until the new strings have arrived.
  - Areas, devices and entities come from the registries Home Assistant
    already keeps in the browser instead of downloading the full lists (the
    entity list is several MB on large installations).
  - The homepage, devices page and status bar render only when something
    they show changed, not on every state change in the house.
  - Pages are built once: before, the layout rebuilt them while Home
    Assistant set up the view, creating every card twice.
  - File names of the bundle parts carry a version or content hash, so
    browsers never keep an outdated copy.
- **Live updates:** moving an entity to another area, adding an area or
  renaming something in Home Assistant shows up without reloading the page.
- **Removed:** the own update entity, which checked a server of the original
  author (HACS reports new versions); it is removed from the entity registry
  on the first start.
- **Fixed:** content no longer slides under the iPhone notch and status bar;
  camera entities in the house information popup and `input_datetime`
  entities in the status bar no longer cause errors; menus and dialogs use the
  current Home Assistant components (a click on the text next to a checkbox
  toggles it).
- **New:** sensors and binary sensors below the area name are chosen per area
  under *Edit* of the area tile (only the entities of that area are offered).
  A chosen sensor replaces the average of its device class on that tile. The
  global lists of earlier versions are moved into the areas automatically on
  the first start (backup in `dwains-dashboard/backups/`).
- **New:** renaming an entity in Home Assistant now takes its dashboard
  settings, custom card and popup along automatically.
- **New:** *Clean up orphaned settings* in the dashboard settings (Settings →
  Devices & services → Dwains Dashboard → Configure) lists dashboard settings
  for entities or areas that no longer exist (including the weather and alarm
  entity and area graphs) and removes them on confirmation, after copying them
  to `dwains-dashboard/backups/`. Disabled or unavailable entities and entities
  of integrations that are not loaded are never affected.
- **New:** *Export settings* and *Import settings* in the same menu. The
  export packs all dashboard settings (areas, entities, cards, more pages,
  blueprints, sidebar title and icon) into a zip that is downloaded right from
  the dialog. The import replaces the settings with such a file; the previous
  settings are moved to `dwains-dashboard/backups/` first and restored if the
  import fails. Both take the YAML files of the dashboard folder only: hidden
  files and folders (such as `.DS_Store`), other file types, symlinks and the
  backups are left out, so every export can be imported again. An export holds
  at most 5000 files, 50 MB and 5 MB per file; an import checks the same
  limits before it unpacks anything.
- **Backups:** `dwains-dashboard/backups/` keeps the 10 newest backups of each
  kind (import, cleanup, migration) and the 5 newest exports; older ones are
  removed when a new one is made. Copy a backup elsewhere to keep it longer.
- **New:** choose the entries of the house status bar (persons, lights,
  climate, smoke, doors, …) in the dashboard settings. The bar stays one row
  and scrolls sideways when it is full, also with the mouse wheel.
- **New:** *Cards in rows of equal height (no masonry)* in the dashboard
  settings for favorites and the area view, as in earlier versions.
- **New:** diagnostics download (Settings → Devices & services → Dwains
  Dashboard → ⋮ → Download diagnostics), including the orphaned entries.
- **New:** optional history graph at the bottom of an area tile. Pick a
  sensor and a period (6 h to 7 days) under *Edit* of the area tile; leave the
  sensor empty for no graph. All tiles share one recorder request per period
  and refresh together every 10 minutes; periods of 2 and 7 days use the
  hourly long-term statistics (sensors without statistics fall back to their
  history). A click on the graph opens the sensor's history.
- **Refresh:** values below the area name follow the Home Assistant language
  (`24,1 °C · 48 %` in German) and are separated by `·`; area badges are
  rounder.
- **Area badges:** more sensor types get a badge on the area tile and in the
  house status bar: gas, carbon monoxide, problem, safety, opening (plain
  door/window contacts), garage door and lock. Open valves, running
  humidifiers, mowing lawn mowers and active sirens are shown like the vacuum.
  "Running" no longer uses the smoke detector icon. Safety first: smoke, CO,
  gas, water and problems come before doors, windows and motion. Hovering a
  badge tells what it counts ("2 windows open"), in all ten languages.

## Development

```bash
# Frontend (Node 22, see .nvmrc): sources in frontend/src
npm ci
npm run lint      # names used but never defined
npm test          # unit tests
npm run build     # writes custom_components/dwains_dashboard/js/* (+ .gz) and const.py revision

# Backend (Python 3.14)
pip install -r requirements_test.txt   # requirements_test_min.txt: oldest supported release
pytest

# Browser tests against a real Home Assistant (port 8124)
pip install $(python tests/e2e/base_requirements.py)
npm run e2e
```

Strings live in `frontend/src/translations/<language>.json`; English is
bundled, the build writes the others to `js/lang/`. The settings dialogs and
repair messages use `custom_components/dwains_dashboard/translations/`; a test
checks that every language there has all English strings and placeholders.

CI rebuilds the bundle and fails if the committed files differ from the sources,
runs the unit and browser tests against the oldest supported Home Assistant
release (2026.5), the pinned current release and the newest beta, and validates
the integration with hassfest and HACS. The workflow actions are pinned to
commit SHAs; Dependabot proposes their updates.

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

<a href="https://discord.gg/7yt64uX">
    <img src="https://img.shields.io/discord/688401603811999885" />
</a>

![GitHub stars](https://img.shields.io/github/stars/dwainscheeren/dwains-lovelace-dashboard?style=social)
![GitHub forks](https://img.shields.io/github/forks/dwainscheeren/dwains-lovelace-dashboard?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/dwainscheeren/dwains-lovelace-dashboard?style=social)
![GitHub followers](https://img.shields.io/github/followers/dwainscheeren?style=social)

<a href="https://www.youtube.com/channel/UCb2GBaLC4d0rVn9pZbYbQ9A"><img src="https://img.shields.io/badge/-YouTube-red?&style=for-the-badge&logo=youtube&logoColor=white" height=25></a>

<a href="https://www.buymeacoffee.com/FAkYvrx" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

<a href="https://www.paypal.me/dwainscheeren"><img src="https://www.paypalobjects.com/en_US/NL/i/btn/btn_donateCC_LG.gif" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button"></a>

[**How to install Dwains Dashboard**](https://dwainscheeren.github.io/dwains-lovelace-dashboard/v3/information/installation.html#installation)

![github-1 copy](https://user-images.githubusercontent.com/3868853/164969724-bda3d9ed-f86e-4f69-9583-2302ffc28bd9.jpg)
![github-2](https://user-images.githubusercontent.com/3868853/164969716-37242ed4-c2f1-4f59-9fc9-a277138033ff.jpg)
![github-3](https://user-images.githubusercontent.com/3868853/164969718-4353c600-5dff-4626-af3a-1a3f1b540332.jpg)
![github-4](https://user-images.githubusercontent.com/3868853/164969719-e40b1119-bf76-47a0-ae83-8af127fdb12f.jpg)



# Dwains Lovelace Dashboard

Hello, I am Dwain. I've been using Home Assistant for over two years now. At the end of summer 2019 I thought, "Why hasn't anybody made a dashboard yet that builds itself automatically by providing only minimum configuration info?" 

I own a web development company, and I want to give something back to the Home Assistant community. So I decided to build this dashboard and release it to the public. The result: Dwains Lovelace Dashboard.

**Install**

Want to know how to install Dwains Dashboard? Read the installation instructions here: [https://dwainscheeren.github.io/dwains-lovelace-dashboard/v3/information/installation.html](https://dwainscheeren.github.io/dwains-lovelace-dashboard/v3/information/installation.html#installation). It are only 3 steps! :)
Please note if you had previously Dwains Dashboard v1 or v2 installed you need to [follow the upgrade guide explained here](https://dwainscheeren.github.io/dwains-lovelace-dashboard/v3/information/migrate-v2-to-v3.html#migrate-from-existing-dwains-dashboard-v2-installation-to-v3).

**Want to request a new feature request?**

DD3 is no longer under active feature development. Please check [Dwains Dashboard Next](https://github.com/dwainscheeren/dwains-dashboard-next) for future feature requests.

**Support**

You can use the [thread on the Home Assistant community](https://community.home-assistant.io/t/dwains-theme-an-auto-generating-lovelace-ui-theme/168593) to ask any questions you have. 

Or join me on Dwains Dashboard Discord [Discord Server Home Assistant Addicts](https://discord.gg/7yt64uX).

**YouTube Channel**

If you like my content, then please do subscribe to my [Home Assistant YouTube channel](https://www.youtube.com/channel/UCb2GBaLC4d0rVn9pZbYbQ9A) I will start posting some more videos there soon.

**Like what you see?**

If you appreciate what I have developed, then please consider buying me a coffe or beer: [Buy me a coffee/beer](https://www.buymeacoffee.com/FAkYvrx) or [donate to my PayPal account](https://www.paypal.me/dwainscheeren).
You can also reply to [this HA thread](https://community.home-assistant.io/t/dwains-theme-an-auto-generating-lovelace-ui-theme/168593) and let everyone know how happy you are with this dashboard!

Greetings,

Dwain

**EXTRA LICENSE INFORMATION**
You are not allowed without my permission to resell, re-distribute or sell my dashboard!




