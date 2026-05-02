class AtomIdeProvider {
  constructor(createProvider) {
    this.createProvider = createProvider;
    this.messages = new Set();
  }

  async reportBusyWhile(title, f, options) {
    const busyMessage = this.reportBusy(title, options);
    try {
      return await f();
    } finally {
      busyMessage.dispose();
    }
  }

  reportBusy(title, options) {
    const provider = this.createProvider();
    provider.add(title, options);

    const busyMessage = {
      setTitle: (newTitle) => {
        provider.changeTitle(newTitle, title);
        title = newTitle;
      },
      dispose: () => {
        provider.dispose();
        this.messages.delete(busyMessage);
      },
    };
    this.messages.add(busyMessage);

    return busyMessage;
  }

  dispose() {
    this.messages.forEach((msg) => {
      msg.dispose();
    });
    this.messages.clear();
  }
}

module.exports = { AtomIdeProvider };
