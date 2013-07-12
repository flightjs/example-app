'use strict';

define(
  [
    'components/flight/lib/component'
  ],

  function(defineComponent) {
    //create a component constructor augmented by the composeBox function and withSelect mixin
    return defineComponent(mailControls);

    function mailControls() {
      //attributes that are not expected to be modified, but can be overriden during attachTo
      this.defaultAttrs({
        //selectors
        actionControlsSelector: 'button.mail-action',
        deleteControlSelector: '#delete_mail',
        moveControlSelector: '#move_mail',
        forwardControlSelector: '#forward',
        replyControlSelector: '#reply',
        singleItemActionSelector: 'button.single-item'
      });

      this.disableAll = function() {
        this.select('actionControlsSelector').attr('disabled', 'disabled');
      };

      this.restyleOnSelectionChange = function(ev, data) {
        if (data.selectedIds.length > 1) {
          this.select('actionControlsSelector').not('button.single-item').removeAttr('disabled');
          this.select('singleItemActionSelector').attr('disabled', 'disabled');
        } else if (data.selectedIds.length == 1) {
          this.select('actionControlsSelector').removeAttr('disabled');
        } else {
          this.disableAll();
        }
      };

      //message that user wants to delete mail
      this.deleteMail = function(ev, data) {
        this.trigger('uiDeleteMail');
      };

      //message that user wants to move mail
      this.moveMail = function(ev, data) {
        this.trigger('uiMoveMail');
      };

      //message that user wants to forward mail
      this.forwardMail = function(ev, data) {
        this.trigger('uiForwardMail');
      };

      //message that user wants to reply to mail
      this.replyToMail = function(ev, data) {
        this.trigger('uiReplyToMail');
      };

      //code to be run when the instance is created
      this.after('initialize', function() {
        this.on(document, 'uiMailItemSelectionChanged', this.restyleOnSelectionChange);
        this.on(document, 'uiFolderSelectionChanged', this.disableAll);
        //delegate to specific handler based on event target
        this.on('.mail-action', 'click', {
          'deleteControlSelector': this.deleteMail,
          'moveControlSelector': this.moveMail,
          'forwardControlSelector': this.forwardMail,
          'replyControlSelector': this.replyToMail
        });
      });
    }
  }
);

