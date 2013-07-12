'use strict';

define(

  [
    'data/mail_items',
    'data/compose_box',
    'data/move_to',
    'ui/mail_items',
    'ui/mail_controls',
    'ui/compose_box',
    'ui/folders',
    'ui/move_to_selector'
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

    function initialize() {
      MailItemsData.attachTo(document);
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
