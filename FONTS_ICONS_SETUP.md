# BusKá - Fonts & Icons Setup

This document explains how to set up Inter font and Material Icons for all platforms.

## Overview

- **Font**: Inter (Google Fonts)
- **Icons**: Material Icons (via react-native-vector-icons)

## Web Setup (Already Configured)

The web version loads fonts via Google Fonts CDN in `public/index.html`:
- Inter font family (400, 500, 600, 700 weights)
- Material Icons (including Rounded variant)

No additional setup required for web.

## Android Setup

### 1. Link the fonts (automatic with react-native.config.js)

The fonts are configured to be linked automatically. Run:

```bash
npx react-native-asset
```

### 2. Verify build.gradle

The `android/app/build.gradle` already includes:
```gradle
project.ext.vectoricons = [
    iconFontNames: [ 'MaterialIcons.ttf' ]
]
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

### 3. Rebuild the app

```bash
cd android && ./gradlew clean && cd ..
npm run android
```

## iOS Setup

### 1. Link the fonts

Run the following to link assets:

```bash
npx react-native-asset
```

### 2. Install CocoaPods

```bash
cd ios && pod install && cd ..
```

### 3. Verify Info.plist

The `ios/projeto1/Info.plist` should include:
```xml
<key>UIAppFonts</key>
<array>
    <string>Inter-Regular.ttf</string>
    <string>Inter-Medium.ttf</string>
    <string>Inter-SemiBold.ttf</string>
    <string>Inter-Bold.ttf</string>
    <string>MaterialIcons.ttf</string>
</array>
```

### 4. Rebuild the app

```bash
npm run ios
```

## Using Icons

```javascript
import Icon, { IconNames } from '../components/Icon';

// Basic usage
<Icon name="directions-bus" size="lg" color={colors.primary.main} />

// Using preset names
<Icon name={IconNames.bus} size="xl" />
<Icon name={IconNames.route} />
<Icon name={IconNames.location} />
```

### Common Icons

| Icon | Name | Usage |
|------|------|-------|
| Bus | `directions-bus` | Vehicles, transport |
| Route | `route` | Routes, paths |
| Location | `location-on` | Points, stops |
| Person | `person` | User profile |
| Group | `group` | Students list |
| Notifications | `notifications` | Alerts |
| Settings | `settings` | Configuration |
| Schedule | `schedule` | Time, trips |
| Check | `check-circle` | Success, confirmed |
| Warning | `warning` | Alerts |
| Play | `play-arrow` | Start trip |
| Stop | `stop` | End trip |

## Using Inter Font

The typography system (`src/theme/typography.js`) is configured to use Inter.

```javascript
import { textStyles, colors } from '../theme';

const styles = StyleSheet.create({
  heading: {
    ...textStyles.h1,
    color: colors.text.primary,
  },
  body: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
});
```

## Troubleshooting

### Icons not showing on mobile

1. Make sure you ran `npx react-native-asset`
2. Rebuild the app completely (clean build)
3. Check that MaterialIcons.ttf is in `android/app/src/main/assets/fonts/`

### Fonts not loading on iOS

1. Open Xcode and verify fonts are in the project
2. Check Info.plist has the UIAppFonts array
3. Clean and rebuild: `cd ios && rm -rf build && pod install && cd ..`

### Web fonts flickering

The fonts are loaded via Google Fonts with `display=swap` to minimize layout shift.
