'use strict';

var _ = require('lodash');

// some of the setters were inspired by
// https://github.com/surevine/webdriverjs-helper/blob/master/source/webdriverjs-helper.coffee
function setSelectableValue(el, val) {
  return el.isSelected(function(checked) {
    if ((!!val && !checked) || (!val && checked)) {
      return el.click();
    }
  });
}

function setTextValue(el, val) {
  return el.sendKeys(val);

}

var typeSetters = {
  file: setTextValue,
  number: setTextValue,
  password: setTextValue,
  search: setTextValue,
  tel: setTextValue,
  text: setTextValue,
  textarea: setTextValue,
  url: setTextValue,

  radio: setSelectableValue,
  checkbox: setSelectableValue,

  select: function(el, vals) {
    // is multiple vals we assume it is a multi-select
    if (_.isString(vals)) {
      vals = [vals];
    }
    return el.findElements(by.tagName('option'))
      .then(function(options) {
        options.map(function(option) {
          option.getAttribute('value')
            .then(function(value) {
              if (_.contains(vals, value)) {
                return setSelectableValue(el, true);
              }
              // removes everything that is not in vals
              return setSelectableValue(el, false);
            });
        });
      });
  },
  unknown: function(el) {
    console.error('field setter not implemented');
    throw new Error('field setter not implemented');
  }
};

function getInputType(inputType) {
  console.log('getInputType:::', inputType);
  if (inputType.match(/checkbox/i)) {
    return 'checkbox';
  }
  if (inputType.match(/radio/i)) {
    return 'radio';
  }
  if (inputType.match(/password/i)) {
    return 'password';
  }
  if (inputType.match(/file/i)) {
    return 'file';
  }
  if (!inputType || inputType.match(/text/i)) {
    return 'text';
  }
  return 'unknownn';
}

function getFieldType(el) {
  return el.getTagName()
    .then(function(tagName) {
      console.log('getTagName', tagName);
      if (tagName.match(/textarea/i)) {
        return 'textarea';
      }
      if (tagName.match(/select/i)) {
        return 'select';
      }
      if (tagName.match(/input/i)) {
        return el.getAttribute('type')
          .then(function(inputType) {
            return getInputType(inputType);
          });
      }
      return 'unknown';
    });
}

module.exports = {
  getType: getFieldType,
  set: function(el, value) {
    this.getType(el)
      .then(function(type) {
        // console.log('type found::', type);
        return typeSetters[type](el, value);
      });
  },
  setters: typeSetters
};