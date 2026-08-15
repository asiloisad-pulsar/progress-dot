# progress-dot

Show a progress dot in the status bar. A base package that provides an easy-to-use API for other packages to signal they are performing a task.

Fork of [busy-signal](https://github.com/steelbrain/busy-signal).

## Features

- **Animated dot indicator**: A colored dot in the status bar pulses orange while busy and turns green when idle.
- **Minimum display duration**: The busy state is shown for at least 1 second to avoid flickering on fast operations.
- **Hover tooltip**: Shows the currently running tasks and a history of recently completed ones with their durations.
- **Two service APIs**: Provides both `atom-ide-busy-signal` (recommended, async-friendly) and `busy-signal` (lower-level, multi-message) service contracts.

## Installation

To install `progress-dot` search for [progress-dot](https://web.pulsar-edit.dev/packages/progress-dot) in the Install pane of the Pulsar settings or run `ppm install progress-dot`. Alternatively, you can run `ppm install asiloisad-pulsar/progress-dot` to install a package directly from the GitHub repository.

## Services

Two service APIs are available. Use `atom-ide-busy-signal` for new packages: async lifecycle is handled automatically and each message is independently disposable. Use `busy-signal` when you need multiple concurrent messages from a single provider or fine-grained `add`/`remove`/`clear` control, or for compatibility with older packages.

## Consumed Service `atom-ide-busy-signal`

High-level API that manages busy messages tied to async operations.

In your `package.json`:

```json
{
  "consumedServices": {
    "atom-ide-busy-signal": {
      "versions": {
        "0.1.0": "consumeBusySignal"
      }
    }
  }
}
```

In your main module:

```javascript
module.exports = {
  async consumeBusySignal(api) {
    // Automatically shown while the promise is pending:
    const result = await api.reportBusyWhile("Downloading data...", () => fetch("https://..."));

    // Or manage the message manually:
    const message = api.reportBusy("Formatting...");
    await format();
    message.setTitle("Writing to disk...");
    await writeToDisk();
    message.dispose();
  },
};
```

### API methods

| Method                       | Returns       | Description                                                     |
| ---------------------------- | ------------- | --------------------------------------------------------------- |
| `reportBusy(title)`          | `BusyMessage` | Show a busy message, returned handle must be disposed when done |
| `reportBusyWhile(title, fn)` | `Promise`     | Show a busy message for the duration of the async `fn`          |

### BusyMessage methods

| Method            | Description             |
| ----------------- | ----------------------- |
| `setTitle(title)` | Update the message text |
| `dispose()`       | Remove the message      |

## Consumed Service `busy-signal`

Low-level API that allows adding and removing busy messages via a `Provider` instance.

In your `package.json`:

```json
{
  "consumedServices": {
    "busy-signal": {
      "versions": {
        "1.0.0": "consumeSignal"
      }
    }
  }
}
```

In your main module:

```javascript
const { CompositeDisposable } = require("atom");

module.exports = {
  activate() {
    this.subscriptions = new CompositeDisposable();
  },
  consumeSignal(registry) {
    const provider = registry.create();
    this.subscriptions.add(provider);
    provider.add("Building project");
    // ... later:
    provider.remove("Building project");
  },
  deactivate() {
    this.subscriptions.dispose();
  },
};
```

### Provider methods

| Method          | Description                                  |
| --------------- | -------------------------------------------- |
| `add(title)`    | Show a busy message with the given title     |
| `remove(title)` | Remove a previously added message            |
| `clear()`       | Remove all messages from this provider       |
| `dispose()`     | Remove all messages and dispose the provider |

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
