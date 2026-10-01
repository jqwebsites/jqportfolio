
const MessageStore = {
  KEY: 'jq_messages',

  // Get every saved message (newest first)
  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch (err) { return []; }
  },

  // Save the whole list
  saveAll(list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  // Add one new message from the contact form
  add({ name, email, message }) {
    const list = this.getAll();
    list.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, email, message,
      date: new Date().toISOString(),
      read: false
    });
    this.saveAll(list);
  }
};