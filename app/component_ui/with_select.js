'use strict';

define(

  function() {

    return withSelect;

    //a function to be in voked in the context of an existing component
    function withSelect() {
      //attributes that are not expected to be modified, but can be overriden during attachTo
      this.defaultAttrs({
        selectedIds: []
      });

      //register current selections
      this.initializeSelections = function() {
        this.select('selectedItemSelector').toArray().forEach(function(el) {
          this.attr.selectedIds.push(el.getAttribute('id'));
        }, this);
      };

      this.getSelectedIds = function() {
        return this.attr.selectedIds;
      };

      this.toggleItemSelect = function(ev, data) {
        var $item = $(data.el), append;

        if ($item.hasClass(this.attr.selectedClass)) {
          this.unselectItem($item);
        } else {
          append = this.attr.allowMultiSelect && (ev.metaKey || ev.ctrlKey || ev.shiftKey);
          this.selectItem($item, append);
        }
      };

      //visually select item and let other components know about it
      this.selectItem = function($item, append) {
        if (!append) {
          this.select('selectedItemSelector').removeClass(this.attr.selectedClass);
          this.attr.selectedIds = [];
        }
        $item.addClass(this.attr.selectedClass);

        this.attr.selectedIds.push($item.attr('id'));
        this.trigger(this.attr.selectionChangedEvent, {selectedIds: this.attr.selectedIds});
      };

      //visually unselect item and let other components know about it
      this.unselectItem = function($item) {
        $item.removeClass(this.attr.selectedClass);

        var thisIdIndex = this.attr.selectedIds.indexOf($item.attr('id'));
        this.attr.selectedIds.splice(thisIdIndex, 1);
        this.trigger(this.attr.selectionChangedEvent, {selectedIds: this.attr.selectedIds});
      };

     //code to be run when the instance is created
      this.after("initialize", function() {
        this.on('click', {
          'itemSelector': this.toggleItemSelect
        });

        this.initializeSelections();
      });
    }
  }
);
