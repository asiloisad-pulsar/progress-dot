const { CompositeDisposable } = require("atom");
const { SignalElement } = require("./element");
const Registry = require("./registry");
const { AtomIdeProvider } = require("./atom-ide-provider");

class BusySignal {
  constructor() {
    this.element = new SignalElement();
    this.registry = new Registry();
    this.atomIdeProvider = new AtomIdeProvider(() => this.registry.create());
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(this.element);
    this.subscriptions.add(this.registry);

    this.registry.onDidUpdate(() => {
      this.element.update(this.registry.getTilesActive(), this.registry.getTilesOld());
    });
  }
  attach(statusBar) {
    const tile = statusBar.addRightTile({ item: this.element, priority: -70 });
    this.subscriptions.add({
      dispose() {
        tile.destroy();
      },
    });
  }
  dispose() {
    this.subscriptions.dispose();
  }
}

module.exports = BusySignal;
