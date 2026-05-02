const BusySignal = require("./main");

module.exports = {
  activate() {
    this.instance = new BusySignal();
  },
  consumeStatusBar(statusBar) {
    this.instance.attach(statusBar);
  },
  providerRegistry() {
    return this.instance.registry;
  },
  provideBusySignal() {
    const provider = this.instance.atomIdeProvider;
    return {
      reportBusyWhile(title, f, options) {
        return provider.reportBusyWhile(title, f, options);
      },
      reportBusy(title, options) {
        return provider.reportBusy(title, options);
      },
      dispose() {
        // nop
      },
    };
  },
  deactivate() {
    this.instance.dispose();
  },
};
