//boot/page.js
//------------

'use strict';

define(

  [
    'app/component_data/mail_items',
    'app/component_data/compose_box',
    'app/component_data/move_to',
    'app/component_ui/mail_items',
    'app/component_ui/mail_controls',
    'app/component_ui/compose_box',
    'app/component_ui/folders',
    'app/component_ui/move_to_selector'
  ],

  function(
    MailItemsData,
    ComposeBoxData,
    MoveToData,
    MailItemsUI,
    MailControlsUI,
    ComposeBoxUI,
    FoldersUI,
    MoveToSelectorUI) {

    //called on page load
    function initialize() {
      //instantiates components by attaching constructors to DOM nodes
      MailItemsData.attachTo(document);
      //optional second argument is an object whose properties will override default attrs in component definition
      ComposeBoxData.attachTo(document, {
        selectedFolders: ['inbox']
      });
      MoveToData.attachTo(document);
      MailItemsUI.attachTo('#mail_items', {
        itemContainerSelector: '#mail_items_TB',
        selectedFolders: ['inbox']
      });
      MailControlsUI.attachTo('#mail_controls');
      ComposeBoxUI.attachTo('#compose_box');
      FoldersUI.attachTo('#folders');
      MoveToSelectorUI.attachTo('#move_to_selector', {
        moveActionSelector: '#move_mail',
        selectedFolders: ['inbox']
      });
    }

    return initialize;
  }
);

//component_data/compose_box.js
//-----------------------------

'use strict';

define(

  [
    'components/flight/lib/component',
    'components/mustache/mustache',
    'app/data',
    'app/templates'
  ],

  function(defineComponent, Mustache, dataStore, templates) {
    //create a component constructor augmented by the composeBox function (with no mixins)
    return defineComponent(composeBox);

    function composeBox() {
      //attributes that are not expected to be modified, but can be overriden during attachTo
      this.defaultAttrs({
        dataStore: dataStore,
        recipientHintId: 'recipient_hint',
        subjectHint: 'Subject',
        messageHint: 'Message',
        toHint: 'To',
        forwardPrefix: 'Fw',
        replyPrefix: 'Re'
      });

      //given a data set, render the compose box
      this.serveComposeBox = function(ev, data) {
        this.trigger("dataComposeBoxServed", {
          markup: this.renderComposeBox(data.type, data.relatedMailId),
          type: data.type});
      };

      //get the subject for replies and fwds
      this.getSubject = function(type, relatedMailId) {
        var relatedMail = this.attr.dataStore.mail.filter(function(each) {
          return each.id ==  relatedMailId;
        })[0];

        var subject = relatedMail && relatedMail.subject;

        var subjectLookup = {
          newMail: this.attr.subjectHint,
          forward: this.attr.forwardPrefix + ": " + subject,
          reply: this.attr.replyPrefix + ": " + subject
        }

        return subjectLookup[type];
      };

      //populate the template view and apply it
      this.renderComposeBox = function(type, relatedMailId) {
        var recipientId = this.getRecipientId(type, relatedMailId);
        var contacts = this.attr.dataStore.contacts.map(function(contact) {
          contact.recipient = (contact.id == recipientId);
          return contact;
        });

        return Mustache.render(templates.composeBox, {
          newMail: type == 'newMail',
          reply: type == 'reply',
          subject: this.getSubject(type, relatedMailId),
          message: this.attr.messageHint,
          contacts: contacts
        });
      };

      this.getRecipientId = function(type, relatedMailId) {
        var relatedMail = (type == 'reply') && this.attr.dataStore.mail.filter(function(each) {
          return each.id ==  relatedMailId;
        })[0];

        return relatedMail && relatedMail.contact_id || this.attr.recipientHintId;
      };

      //update data source
      this.send = function(ev, data) {
        this.attr.dataStore.mail.push({
          id: String(Date.now()),
          contact_id: data.to_id,
          folders: ["sent"],
          time: Date.now(),
          subject: data.subject,
          message: data.message
        });
        //we're done - let people know
        this.trigger('dataMailItemsRefreshRequested', {folder: data.currentFolder});
      };

      //code to be run when the instance is created
      this.after("initialize", function() {
        this.on("uiComposeBoxRequested", this.serveComposeBox);
        this.on("uiSendRequested", this.send);
      });
    }

  }
);

//component_data/mail_items.js
//----------------------------

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

//component_data/move_to.js
//--------------------------