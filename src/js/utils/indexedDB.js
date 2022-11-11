export default class IndexedDB {
  constructor(indexedDB, dbName, dbVersion, stores) {
    this.indexedDB = indexedDB;
    this.db = null;
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.stores = stores;
  }

  openDB(callback) {
    if (!this.indexedDB) {
      callback({ message: 'Unsupported window.indexedDB' });
      return;
    }
    const request = this.indexedDB.open(this.dbName, this.dbVersion);

    if (this.db) {
      callback();
      return;
    }

    request.onsuccess = () => {
      this.db = request.result;
      callback();
    };
    request.onerror = (e) => callback(e.target.error);
    request.onupgradeneeded = () => {
      this.db = request.result;
      this.stores.forEach((o) => {
        const objStore = this.db.createObjectStore(o.name, o.option);
        if (o.indexes?.length > 0) {
          for (let i = 0; i < o.indexes?.length; i++) {
            objStore.createIndex(o.indexes[i].name, o.indexes[i].field, {
              unique: false,
            });
          }
        }
      });
    };
  }

  add(storeName, data, callback) {
    if (this.db && data && storeName) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      transaction.onabort = (te) => callback(te.target.error);
      transaction.onerror = (te) => callback(te.target.error);

      const request = transaction.objectStore(storeName).put(data);
      request.onerror = (e) => callback(e.target.error);
      request.onsuccess = () => callback(data);
    } else {
      callback(null);
    }
  }

  update(storeName, data, callback) {
    if (this.db && data && storeName) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      transaction.onabort = (te) => callback(te.target.error);
      transaction.onerror = (te) => callback(te.target.error);

      const request = transaction.objectStore(storeName).put(data);
      request.onerror = (e) => callback(e.target.error);
      request.onsuccess = () => callback(data);
    } else {
      callback(null);
    }
  }

  get(storeName, key, callback) {
    if (this.db && key && storeName) {
      const request = this.db
        .transaction([storeName])
        .objectStore(storeName)
        .get(key);
      request.onerror = (e) => callback(e.target.error);
      request.onsuccess = (e) => callback(e.target.result);
    } else {
      callback(null);
    }
  }

  getAll(storeName, callback) {
    if (this.db && storeName) {
      const request = this.db
        .transaction([storeName])
        .objectStore(storeName)
        .getAll();

      request.onsuccess = (e) => {
        const results = e.target.result;

        callback(results);
      };

      request.onerror = (e) => callback(e.target.error);
    } else {
      callback(null);
    }
  }

  remove(storeName, key, callback) {
    if (this.db && storeName) {
      const request = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .delete(key);
      request.onerror = (e) => callback(e.target.error);
      request.onsuccess = (e) => callback(e.target.result);
    } else {
      callback(null);
    }
  }

  removeByIndex(storeName, indexName, indexValue, callback) {
    if (this.db && storeName) {
      const objStore = this.db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName);

      const index = objStore.index(indexName);
      const destroy = index.openKeyCursor(IDBKeyRange.only(indexValue));

      destroy.onerror = (e) => callback(e.target.error);
      destroy.onsuccess = () => {
        const cursor = destroy.result;
        if (cursor) {
          objStore.delete(cursor.primaryKey);
          cursor.continue();
        }
        return callback();
      };
    } else {
      callback(null);
    }
  }

  clear(storeName, callback) {
    if (this.db && storeName) {
      const request = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .clear();
      request.onerror = (e) => callback(e.target.error);
      request.onsuccess = (e) => callback(e.target.result);
    } else {
      callback(null);
    }
  }

  count(storeName, callback) {
    if (this.db && storeName) {
      const request = this.db
        .transaction([storeName])
        .objectStore(storeName)
        .count();

      request.onerror = (e) => callback(e.target.error);
      request.onsuccess = (e) => callback(e.target.result);
    } else {
      callback(null);
    }
  }
}
