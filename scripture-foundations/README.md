# Scripture Foundations

A mobile-first Bible learning app built from the *Scripture Foundations* design specification. It's built with React, TypeScript and Tailwind, and packaged for Android with Capacitor. It works fully offline, needs no account, and stores all progress on the device.

## What's included

| Spec area | Status |
|---|---|
| Verified KJV import (66 books, 1,189 chapters, 31,102 verses; checksummed and cross-checked against an independent dataset) | ✅ |
| Verified BSB import from BSB Publishing's official release (31,086 verses; the 16 verses it omits are marked where they occur). Switch between KJV and BSB in Settings | ✅ |
| Website version: installable and works offline, served from any folder on your site | ✅ |
| Seven-category library: all 30 topics, memorization passages, typed cross-references, cautions, exercises | ✅ |
| Three fully authored MVP lessons: Ephesians 2:8–10 · Matthew 22:37–40 · Matthew 28:19 + John 1:1–14 | ✅ |
| Guided lessons generated for the other 27 topics (read, context, memorize, connect, apply, review) | ✅ |
| Memorization: read & chunk, progressive hide (0–100%, deterministic), phrase ordering, typed recall with word diff, reference recall (book, chapter and verse graded separately) | ✅ |
| Comprehension questions with a rationale for every choice and supporting evidence; short answers with sample reasoning | ✅ |
| Passage viewer with full chapter context and two-way cross-reference navigation, filterable by relationship type and Testament | ✅ |
| FSRS scheduling with separate cards for text, reference and understanding; a passage used in several topics has one shared card | ✅ |
| Doctrine Explorer for the 8 Category 7 doctrines: explicit / inferred / disputed claims, labeled traditions, challenge passages | ✅ |
| Study lens (Broad, Adventist, Evangelical, Reformed, Catholic, Orthodox): highlights a tradition, never hides others or changes the text | ✅ |
| Progress (four independent competencies, 14-day retention, coverage), streak, daily caps | ✅ |
| Settings: theme, text size, verse numbers, export/import/delete data | ✅ |
| Supabase sign-in and sync, audio recitation, AI tutor, admin review workflow | ⏳ Later phases |

## Content rules that are enforced in code

* **Scripture text is never typed or generated.** It comes only from `public/data/kjv.json`, which `scripts/import-kjv.mjs` produces.
* Any KJV wording quoted in editorial prose is wrapped in `«…»`. A test checks every quoted phrase against the imported text.
* Every reference in the curriculum is checked against the verified verse counts.
* Every cross-reference has a typed relationship. Editorial notes are marked **Draft** until a human reviews them.

## Run it

```bash
npm install
npm test          # 23 content-validation and acceptance tests
npm run dev       # open http://localhost:5173 in a browser
```

## Put it on DevoutFaith.com (web version)

The same app runs as a website. Visitors can use it in the browser or install it ("Add to Home Screen"), and it works offline after the first visit.

1. Run `npm run build:web` (or download **scripture-web** from the GitHub Actions run). This creates `scripture-web.zip`.
2. In Hostinger, open **hPanel → Files → File Manager → public_html**. Create a folder, e.g. `scripture`.
3. Upload `scripture-web.zip` into that folder and choose **Extract**. Check that `index.html`, `sw.js`, `.htaccess`, `assets/`, `data/` and `icons/` sit directly inside `scripture/`.
4. Visit **https://devoutfaith.com/scripture/**.

Notes:
* WordPress ignores real folders, so the app runs beside your WordPress site without a plugin. If you run WordPress Multisite with subdirectories, choose a folder name that isn't also a site slug.
* LiteSpeed Cache won't interfere, because these are plain static files. If an update doesn't show up, purge the cache once.
* Offline mode and installing require HTTPS, which Hostinger provides.
* To show it inside a WordPress page, add a Custom HTML block containing `<iframe src="/scripture/" style="width:100%;height:85vh;border:0"></iframe>`. Linking to the page directly gives a better mobile experience.
* Progress is saved in each visitor's own browser. Nothing is sent to your server.

## Build the Android app

### Option A: let GitHub build the APK (no Android Studio needed)
1. Push to the `main` branch of your GitHub repository.
2. Open the **Actions** tab. The *Build Scripture Foundations* workflow runs the tests, then builds the Android APK and the website zip.
3. Download **scripture-foundations-debug-apk** from the run. Copy it to your phone and install it (allow "install unknown apps").

### Option B: Android Studio
```bash
npm run android:sync   # builds the web app and copies it into android/
npm run android:open   # opens Android Studio, then press Run ▶
```

### Publishing to Google Play
1. Create an upload keystore:
   `keytool -genkey -v -keystore release.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000`
2. Add these GitHub repository secrets: `ANDROID_KEYSTORE_BASE64` (the output of `base64 -w0 release.keystore`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`.
3. The workflow will then also produce a signed `app-release.aab` to upload to the Play Console.
4. Before each release, raise `versionCode` and `versionName` in `android/app/build.gradle`. The app ID is `com.scripturefoundations.app` (set in `capacitor.config.ts`); change it before your first upload if you want a different one.

## Re-importing or adding translations

```bash
./scripts/fetch-sources.sh && npm run import:kjv && npm run import:bsb && npm test
```
To add another public-domain translation (e.g. WEB or ASV), write an importer that outputs the same `b[book][chapter][verse]` format with a manifest. Then add an entry to `TRANSLATIONS` in `src/bible/bible.ts`.

## Project layout

```
scripts/import-kjv.mjs     verified KJV importer (validation, checksums, cross-check)
scripts/import-bsb.mjs     verified BSB importer (official USFM, omitted-verse handling, cross-check)
public/data/*.json         runtime Scripture data (generated)
public/sw.js, .htaccess    offline support and server config for the website
src/bible/                 books, reference parser/formatter, text loader
src/content/               curriculum, authored lessons, doctrines, tests
src/study/                 FSRS scheduler, text alignment, chunking, persistent store
src/components/            UI, Scripture display, memorization modes, assessments
src/screens/               Dashboard, Library, Lesson, Passage, Review, Doctrine, Progress, Settings, Search
android/                   Capacitor Android project
```

**Editorial note:** Explanations, cross-reference notes and doctrinal summaries are drafts. Have them reviewed theologically before you publish.
