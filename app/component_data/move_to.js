'use strict';

define(

  [
    'components/flight/lib/component',
    'components/mustache/mustache',
    'app/data',
    'app/templates'
  ],

  function(defineComponent, Mustache, dataStore, templates) {
    //create a component constructor augmented by the moveTo function (with no mixins)
    return defineComponent(moveTo);

    function moveTo() {
      //attributes that are not expected to be modified, but can be overriden during attachTo
      this.defaultAttrs({
        dataStore: dataStore
      });

      //render a folder list using the supplied data
      this.serveAvailableFolders = function(ev, data) {
        this.trigger("dataMoveToItemsServed", {
          markup: this.renderFolderSelector(this.getOtherFolders(data.folder))
        })
      };

      //create a view and apply a template to it
      this.renderFolderSelector = function(items) {
        return Mustache.render(templates.moveToSelector, {moveToItems: items});
      };

      //update the data store with moved items
      this.moveItems = function(ev, data) {
        var itemsToMoveIds = data.itemIds
        this.attr.dataStore.mail.forEach(function(item) {
          if (itemsToMoveIds.indexOf(item.id) > -1) {
            item.folders = [data.toFolder];
          }
        });
        //let it be known we're done
        this.trigger('dataMailItemsRefreshRequested', {folder: data.fromFolder});
      };

      this.getOtherFolders = function(folder) {
        return this.attr.dataStore.folders.filter(function(e) {return e != folder});
      };

      //code to be run when the instance is created
      this.after("initialize", function() {
        this.on("uiAvailableFoldersRequested", this.serveAvailableFolders);
        this.on("uiMoveItemsRequested", this.moveItems);
      });
    }

  }
);
