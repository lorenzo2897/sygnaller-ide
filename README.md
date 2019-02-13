# Sygnaller

A cross-domain signal processing IDE

## Prepare

Requires node and npm to build.

```
npm install
```

## Build

`npm run serve` — Serve the webview contents in a browser with live reload

`npm run build-angular` — Only build the webview contents

`npm run build-electron` — Build the webview contents and the electron app

`npm run electron` — Just run the electron app, no building

## Configuring Semantic-UI

#### Changing the theme

Edit `semantic/src/theme.config` and replace all instances with desired theme name

#### Building the CSS file

```
npm run build-semantic
```

## Testing

```
npm run test
```

```
npm run e2e
```

## Packaging

Packaged executable can only be built for the current host platform.

```
npm run package
```
