'use strict';

define(

  [
    'components/flight/lib/component',
    'components/mustache/mustache',
    'app/data',
    'app/templates'
  ],

  function(defineComponent, Mustache, dataStore, templates) {
    //create a component constructor augmented by the mailItems function (with no mixins)
    return defineComponent(mailItems);

    function mailItems() {
      //attributes that are not expected to be modified, but can be overriden during attachTo
      this.defaultAttrs({
        folder: 'inbox',
        dataStore: dataStore
      });

      //render the mail items over the given data set
      this.serveMailItems = function(ev, data) {
        var folder = (data && data.folder) || this.attr.folder;
        this.trigger("dataMailItemsServed", {markup: this.renderItems(this.assembleItems(folder))})
      };

      //create a view and apply it to to the mailItem template
      this.renderItems = function(items) {
        return Mustache.render(templates.mailItem, {mailItems: items});
      };

      //build the template view using items data
      this.assembleItems = function(folder) {
        var items = [];

        this.attr.dataStore.mail.forEach(function(each) {
          if (each.folders && each.folders.indexOf(folder) > -1) {
            items.push(this.getItemForView(each));
          }
        }, this);

        return items;
      };

      //format a data item for the template view
      this.getItemForView = function(itemData) {
        var thisItem, thisContact, msg

        thisItem = {id: itemData.id, important: itemData.important};

        thisContact = this.attr.dataStore.contacts.filter(function(contact) {
          return contact.id == itemData.contact_id
        })[0];
        thisItem.name = [thisContact.firstName, thisContact.lastName].join(' ');

        var subj = itemData.subject;
        thisItem.formattedSubject = subj.length > 70 ? subj.slice(0, 70) + "..." : subj;

        var msg = itemData.message;
        thisItem.formattedMessage = msg.length > 70 ? msg.slice(0, 70) + "..." : msg;

        return thisItem;
      };

      //code to be run when the instance is created
      this.after("initialize", function() {
        this.on("uiMailItemsRequested", this.serveMailItems);
        this.on("dataMailItemsRefreshRequested", this.serveMailItems);
      });
    }
  }
);
