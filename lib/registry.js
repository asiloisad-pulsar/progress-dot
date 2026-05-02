const { CompositeDisposable, Emitter } = require("atom");
const Provider = require("./provider");

function formatMs(n) {
  if (n < 1000) return `${n}ms`;
  return `${(n / 1000).toFixed(1)}s`;
}

class Registry {
  constructor() {
    this.emitter = new Emitter();
    this.providers = new Set();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.emitter);

    this.statuses = new Map();
    this.statusHistory = [];
  }
  // Public method
  create() {
    const provider = new Provider();
    provider.onDidAdd(({ title, options }) => {
      this.statusAdd(provider, title, options);
    });
    provider.onDidRemove((title) => {
      this.statusRemove(provider, title);
    });
    provider.onDidChangeTitle(({ title, oldTitle }) => {
      this.statusChangeTitle(provider, title, oldTitle);
    });
    provider.onDidClear(() => {
      this.statusClear(provider);
    });
    provider.onDidDispose(() => {
      this.statusClear(provider);
      this.providers.delete(provider);
    });
    this.providers.add(provider);
    return provider;
  }
  statusAdd(provider, title, options) {
    const key = `${provider.id}::${title}`;
    if (this.statuses.has(key)) {
      this.pushIntoHistory(this.statuses.get(key));
      this.statuses.delete(key);
    }

    const entry = {
      key,
      title,
      provider,
      timeStarted: Date.now(),
      timeStopped: null,
      options,
    };
    this.statuses.set(entry.key, entry);
    this.emitter.emit("did-update");
  }
  statusRemove(provider, title) {
    const key = `${provider.id}::${title}`;
    const value = this.statuses.get(key);
    if (value) {
      this.pushIntoHistory(value);
      this.statuses.delete(key);
      this.emitter.emit("did-update");
    }
  }
  statusChangeTitle(provider, title, oldTitle) {
    const oldKey = `${provider.id}::${oldTitle}`;
    const entry = this.statuses.get(oldKey);
    if (!entry) {
      return;
    }

    this.statuses.delete(oldKey);

    entry.title = title;
    entry.key = `${provider.id}::${title}`;

    this.statuses.set(entry.key, entry);
    this.emitter.emit("did-update");
  }
  statusClear(provider) {
    let triggerUpdate = false;
    this.statuses.forEach((value) => {
      if (value.provider === provider) {
        triggerUpdate = true;
        this.pushIntoHistory(value);
        this.statuses.delete(value.key);
      }
    });
    if (triggerUpdate) {
      this.emitter.emit("did-update");
    }
  }
  pushIntoHistory(status) {
    status.timeStopped = Date.now();
    let i = this.statusHistory.length;
    while (i--) {
      if (this.statusHistory[i].key === status.key) {
        this.statusHistory.splice(i, 1);
        break;
      }
    }
    this.statusHistory.push(status);
    this.statusHistory = this.statusHistory.slice(-10);
  }
  getTilesActive() {
    return Array.from(this.statuses.values()).sort((a, b) => b.timeStarted - a.timeStarted);
  }
  getTilesOld() {
    const oldTiles = [];

    this.statusHistory.forEach((entry) => {
      if (this.statuses.has(entry.key)) return;
      oldTiles.push({
        title: entry.title,
        duration: formatMs((entry.timeStopped || 0) - entry.timeStarted),
      });
    });

    return oldTiles;
  }
  onDidUpdate(callback) {
    return this.emitter.on("did-update", callback);
  }
  dispose() {
    for (const provider of this.providers) {
      provider.dispose();
    }
    this.subscriptions.dispose();
  }
}

module.exports = Registry;
