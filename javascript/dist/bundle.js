(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var FileBackend = (function (_Events) {
	_inherits(FileBackend, _Events);

	function FileBackend(fetch_url, search_url, update_url, delete_url, limit, bulkActions, $folder, currentFolder) {
		_classCallCheck(this, FileBackend);

		_get(Object.getPrototypeOf(FileBackend.prototype), 'constructor', this).call(this);

		this.fetch_url = fetch_url;
		this.search_url = search_url;
		this.update_url = update_url;
		this.delete_url = delete_url;
		this.limit = limit;
		this.bulkActions = bulkActions;
		this.$folder = $folder;
		this.folder = currentFolder;

		this.page = 1;
	}

	/**
  * @func fetch
  * @param number id
  * @desc Fetches a collection of Files by ParentID.
  */

	_createClass(FileBackend, [{
		key: 'fetch',
		value: function fetch(id) {
			var _this = this;

			if (typeof id === 'undefined') {
				return;
			}

			this.page = 1;

			this.request('POST', this.fetch_url, { id: id }).then(function (json) {
				_this.emit('onFetchData', json);
			});
		}
	}, {
		key: 'search',
		value: function search() {
			var _this2 = this;

			this.page = 1;

			this.request('GET', this.search_url).then(function (json) {
				_this2.emit('onSearchData', json);
			});
		}
	}, {
		key: 'more',
		value: function more() {
			var _this3 = this;

			this.page++;

			this.request('GET', this.search_url).then(function (json) {
				_this3.emit('onMoreData', json);
			});
		}
	}, {
		key: 'navigate',
		value: function navigate(folder) {
			var _this4 = this;

			this.page = 1;
			this.folder = folder;

			this.persistFolderFilter(folder);

			this.request('GET', this.search_url).then(function (json) {
				_this4.emit('onNavigateData', json);
			});
		}
	}, {
		key: 'persistFolderFilter',
		value: function persistFolderFilter(folder) {
			if (folder.substr(-1) === '/') {
				folder = folder.substr(0, folder.length - 1);
			}

			this.$folder.val(folder);
		}
	}, {
		key: 'delete',
		value: function _delete(ids) {
			var _this5 = this;

			var filesToDelete = [];

			// Allows users to pass one or more ids to delete.
			if (Object.prototype.toString.call(ids) !== '[object Array]') {
				filesToDelete.push(ids);
			} else {
				filesToDelete = ids;
			}

			this.request('GET', this.delete_url, {
				'ids': filesToDelete
			}).then(function () {
				// Using for loop because IE10 doesn't handle 'for of',
				// which gets transcompiled into a function which uses Symbol,
				// the thing IE10 dies on.
				for (var i = 0; i < filesToDelete.length; i += 1) {
					_this5.emit('onDeleteData', filesToDelete[i]);
				}
			});
		}
	}, {
		key: 'filter',
		value: function filter(name, type, folder, createdFrom, createdTo, onlySearchInFolder) {
			this.name = name;
			this.type = type;
			this.folder = folder;
			this.createdFrom = createdFrom;
			this.createdTo = createdTo;
			this.onlySearchInFolder = onlySearchInFolder;

			this.search();
		}
	}, {
		key: 'save',
		value: function save(id, values) {
			var _this6 = this;

			var updates = { id: id };

			values.forEach(function (field) {
				updates[field.name] = field.value;
			});

			this.request('POST', this.update_url, updates).then(function () {
				_this6.emit('onSaveData', id, updates);
			});
		}
	}, {
		key: 'request',
		value: function request(method, url) {
			var _this7 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var defaults = {
				'limit': this.limit,
				'page': this.page
			};

			if (this.name && this.name.trim() !== '') {
				defaults.name = decodeURIComponent(this.name);
			}

			if (this.folder && this.folder.trim() !== '') {
				defaults.folder = decodeURIComponent(this.folder);
			}

			if (this.createdFrom && this.createdFrom.trim() !== '') {
				defaults.createdFrom = decodeURIComponent(this.createdFrom);
			}

			if (this.createdTo && this.createdTo.trim() !== '') {
				defaults.createdTo = decodeURIComponent(this.createdTo);
			}

			if (this.onlySearchInFolder && this.onlySearchInFolder.trim() !== '') {
				defaults.onlySearchInFolder = decodeURIComponent(this.onlySearchInFolder);
			}

			this.showLoadingIndicator();

			return _jQuery2['default'].ajax({
				'url': url,
				'method': method,
				'dataType': 'json',
				'data': _jQuery2['default'].extend(defaults, data)
			}).always(function () {
				_this7.hideLoadingIndicator();
			});
		}
	}, {
		key: 'showLoadingIndicator',
		value: function showLoadingIndicator() {
			(0, _jQuery2['default'])('.cms-content, .ui-dialog').addClass('loading');
			(0, _jQuery2['default'])('.ui-dialog-content').css('opacity', '.1');
		}
	}, {
		key: 'hideLoadingIndicator',
		value: function hideLoadingIndicator() {
			(0, _jQuery2['default'])('.cms-content, .ui-dialog').removeClass('loading');
			(0, _jQuery2['default'])('.ui-dialog-content').css('opacity', '1');
		}
	}]);

	return FileBackend;
})(_events2['default']);

exports['default'] = FileBackend;
module.exports = exports['default'];

},{"events":14,"jQuery":"jQuery"}],2:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _stateConfigureStore = require('../state/configureStore');

var _stateConfigureStore2 = _interopRequireDefault(_stateConfigureStore);

var _sectionsGalleryController = require('../sections/gallery/controller');

var _sectionsGalleryController2 = _interopRequireDefault(_sectionsGalleryController);

var _backendFileBackend = require('../backend/file-backend');

var _backendFileBackend2 = _interopRequireDefault(_backendFileBackend);

function getVar(name) {
	var parts = window.location.href.split('?');

	if (parts.length > 1) {
		parts = parts[1].split('#');
	}

	var variables = parts[0].split('&');

	for (var i = 0; i < variables.length; i++) {
		var _parts = variables[i].split('=');

		if (decodeURIComponent(_parts[0]) === name) {
			return decodeURIComponent(_parts[1]);
		}
	}

	return null;
}

function hasSessionStorage() {
	return typeof window.sessionStorage !== 'undefined' && window.sessionStorage !== null;
}

function getProps(props) {
	var $componentWrapper = (0, _jQuery2['default'])('.asset-gallery').find('.asset-gallery-component-wrapper'),
	    $search = (0, _jQuery2['default'])('.cms-search-form'),
	    initialFolder = (0, _jQuery2['default'])('.asset-gallery').data('asset-gallery-initial-folder'),
	    currentFolder = getVar('q[Folder]') || initialFolder,
	    backend,
	    defaults;

	if ($search.find('[type=hidden][name="q[Folder]"]').length == 0) {
		$search.append('<input type="hidden" name="q[Folder]" />');
	}

	// Do we need to set up a default backend?
	if (typeof props === 'undefined' || typeof props.backend === 'undefined') {
		backend = new _backendFileBackend2['default']($componentWrapper.data('asset-gallery-fetch-url'), $componentWrapper.data('asset-gallery-search-url'), $componentWrapper.data('asset-gallery-update-url'), $componentWrapper.data('asset-gallery-delete-url'), $componentWrapper.data('asset-gallery-limit'), $componentWrapper.data('asset-gallery-bulk-actions'), $search.find('[type=hidden][name="q[Folder]"]'), currentFolder);

		backend.emit('filter', getVar('q[Name]'), getVar('q[AppCategory]'), getVar('q[Folder]'), getVar('q[CreatedFrom]'), getVar('q[CreatedTo]'), getVar('q[CurrentFolderOnly]'));
	}

	defaults = {
		backend: backend,
		current_folder: currentFolder,
		cmsEvents: {},
		initial_folder: initialFolder,
		name: (0, _jQuery2['default'])('.asset-gallery').data('asset-gallery-name')
	};

	return _jQuery2['default'].extend(true, defaults, props);
}

var props = getProps();
var store = (0, _stateConfigureStore2['default'])(); //Create the redux store

_reactDom2['default'].render(_react2['default'].createElement(
	_reactRedux.Provider,
	{ store: store },
	_react2['default'].createElement(_sectionsGalleryController2['default'], props)
), (0, _jQuery2['default'])('.asset-gallery-component-wrapper')[0]);

},{"../backend/file-backend":1,"../sections/gallery/controller":8,"../state/configureStore":10,"jQuery":"jQuery","react":"react","react-dom":"react-dom","react-redux":"react-redux"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _stateGalleryActions = require('../../state/gallery/actions');

var galleryActions = _interopRequireWildcard(_stateGalleryActions);

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var BulkActionsComponent = (function (_SilverStripeComponent) {
	_inherits(BulkActionsComponent, _SilverStripeComponent);

	function BulkActionsComponent(props) {
		_classCallCheck(this, BulkActionsComponent);

		_get(Object.getPrototypeOf(BulkActionsComponent.prototype), 'constructor', this).call(this, props);

		this.onChangeValue = this.onChangeValue.bind(this);
	}

	_createClass(BulkActionsComponent, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var $select = (0, _jQuery2['default'])(_reactDom2['default'].findDOMNode(this)).find('.dropdown');

			$select.chosen({
				'allow_single_deselect': true,
				'disable_search_threshold': 20
			});

			// Chosen stops the change event from reaching React so we have to simulate a click.
			$select.change(function () {
				return _reactAddonsTestUtils2['default'].Simulate.click($select.find(':selected')[0]);
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var _this = this;

			return _react2['default'].createElement(
				'div',
				{ className: 'gallery__bulk-actions fieldholder-small' },
				_react2['default'].createElement(
					'select',
					{ className: 'dropdown no-change-track no-chzn', tabIndex: '0', 'data-placeholder': this.props.gallery.bulkActions.placeholder, style: { width: '160px' } },
					_react2['default'].createElement('option', { selected: true, disabled: true, hidden: true, value: '' }),
					this.props.gallery.bulkActions.options.map(function (option, i) {
						return _react2['default'].createElement(
							'option',
							{ key: i, onClick: _this.onChangeValue, value: option.value },
							option.label
						);
					})
				)
			);
		}
	}, {
		key: 'getOptionByValue',
		value: function getOptionByValue(value) {
			// Using for loop because IE10 doesn't handle 'for of',
			// which gets transcompiled into a function which uses Symbol,
			// the thing IE10 dies on.
			for (var i = 0; i < this.props.gallery.bulkActions.options.length; i += 1) {
				if (this.props.gallery.bulkActions.options[i].value === value) {
					return this.props.gallery.bulkActions.options[i];
				}
			}

			return null;
		}
	}, {
		key: 'getSelectedFiles',
		value: function getSelectedFiles() {
			return this.props.gallery.selectedFiles;
		}
	}, {
		key: 'applyAction',
		value: function applyAction(value) {
			// We only have 'delete' right now...
			switch (value) {
				case 'delete':
					this.props.backend['delete'](this.getSelectedFiles());
				default:
					return false;
			}
		}
	}, {
		key: 'onChangeValue',
		value: function onChangeValue(event) {
			var option = this.getOptionByValue(event.target.value);

			// Make sure a valid option has been selected.
			if (option === null) {
				return;
			}

			if (option.destructive === true) {
				if (confirm(_i18n2['default'].sprintf(_i18n2['default']._t('AssetGalleryField.BULK_ACTIONS_CONFIRM'), option.label))) {
					this.applyAction(option.value);
				}
			} else {
				this.applyAction(option.value);
			}

			// Reset the dropdown to it's placeholder value.
			(0, _jQuery2['default'])(_reactDom2['default'].findDOMNode(this)).find('.dropdown').val('').trigger('liszt:updated');
		}
	}]);

	return BulkActionsComponent;
})(_silverstripeComponent2['default']);

exports['default'] = BulkActionsComponent;
;

function mapStateToProps(state) {
	return {
		gallery: state.assetAdmin.gallery
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: (0, _redux.bindActionCreators)(galleryActions, dispatch)
	};
}

exports['default'] = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(BulkActionsComponent);
module.exports = exports['default'];

},{"../../state/gallery/actions":11,"i18n":"i18n","jQuery":"jQuery","react":"react","react-addons-test-utils":"react-addons-test-utils","react-dom":"react-dom","react-redux":"react-redux","redux":"redux","silverstripe-component":"silverstripe-component"}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _stateGalleryActions = require('../../state/gallery/actions');

var galleryActions = _interopRequireWildcard(_stateGalleryActions);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var FileComponent = (function (_SilverStripeComponent) {
	_inherits(FileComponent, _SilverStripeComponent);

	function FileComponent(props) {
		_classCallCheck(this, FileComponent);

		_get(Object.getPrototypeOf(FileComponent.prototype), 'constructor', this).call(this, props);

		this.getButtonTabIndex = this.getButtonTabIndex.bind(this);
		this.onFileNavigate = this.onFileNavigate.bind(this);
		this.onFileEdit = this.onFileEdit.bind(this);
		this.onFileDelete = this.onFileDelete.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.preventFocus = this.preventFocus.bind(this);
		this.onFileSelect = this.onFileSelect.bind(this);
	}

	_createClass(FileComponent, [{
		key: 'handleDoubleClick',
		value: function handleDoubleClick(event) {
			if (event.target !== _reactDom2['default'].findDOMNode(this.refs.title) && event.target !== _reactDom2['default'].findDOMNode(this.refs.thumbnail)) {
				return;
			}

			this.onFileNavigate(event);
		}
	}, {
		key: 'onFileNavigate',
		value: function onFileNavigate(event) {
			if (this.isFolder()) {
				this.props.onFileNavigate(this.props, event);
				return;
			}

			this.onFileEdit(event);
		}
	}, {
		key: 'onFileSelect',
		value: function onFileSelect(event) {
			event.stopPropagation(); //stop triggering click on root element

			if (this.props.gallery.selectedFiles.indexOf(this.props.id) === -1) {
				this.props.actions.selectFiles(this.props.id);
			} else {
				this.props.actions.deselectFiles(this.props.id);
			}
		}
	}, {
		key: 'onFileEdit',
		value: function onFileEdit(event) {
			var _this = this;

			event.stopPropagation(); //stop triggering click on root element
			this.props.actions.setEditing(this.props.gallery.files.find(function (file) {
				return file.id === _this.props.id;
			}));
		}
	}, {
		key: 'onFileDelete',
		value: function onFileDelete(event) {
			event.stopPropagation(); //stop triggering click on root element
			this.props.onFileDelete(this.props, event);
		}
	}, {
		key: 'isFolder',
		value: function isFolder() {
			return this.props.category === 'folder';
		}
	}, {
		key: 'getThumbnailStyles',
		value: function getThumbnailStyles() {
			if (this.props.category === 'image') {
				return { 'backgroundImage': 'url(' + this.props.url + ')' };
			}

			return {};
		}
	}, {
		key: 'getThumbnailClassNames',
		value: function getThumbnailClassNames() {
			var thumbnailClassNames = 'item__thumbnail';

			if (this.isImageLargerThanThumbnail()) {
				thumbnailClassNames += ' item__thumbnail--large';
			}

			return thumbnailClassNames;
		}
	}, {
		key: 'isSelected',
		value: function isSelected() {
			return this.props.gallery.selectedFiles.indexOf(this.props.id) > -1;
		}
	}, {
		key: 'isFocussed',
		value: function isFocussed() {
			return this.props.gallery.focus === this.props.id;
		}
	}, {
		key: 'getButtonTabIndex',
		value: function getButtonTabIndex() {
			if (this.isFocussed()) {
				return 0;
			} else {
				return -1;
			}
		}
	}, {
		key: 'getItemClassNames',
		value: function getItemClassNames() {
			var itemClassNames = 'item item--' + this.props.category;

			if (this.isFocussed()) {
				itemClassNames += ' item--focussed';
			}

			if (this.isSelected()) {
				itemClassNames += ' item--selected';
			}

			return itemClassNames;
		}
	}, {
		key: 'isImageLargerThanThumbnail',
		value: function isImageLargerThanThumbnail() {
			var dimensions = this.props.attributes.dimensions;

			return dimensions.height > _constants2['default'].THUMBNAIL_HEIGHT || dimensions.width > _constants2['default'].THUMBNAIL_WIDTH;
		}
	}, {
		key: 'handleKeyDown',
		value: function handleKeyDown(event) {
			event.stopPropagation();

			//if event doesn't come from the root element, do nothing
			if (event.target !== _reactDom2['default'].findDOMNode(this.refs.thumbnail)) {
				return;
			}

			//If space is pressed, allow focus on buttons
			if (this.props.spaceKey === event.keyCode) {
				event.preventDefault(); //Stop page from scrolling
				(0, _jQuery2['default'])(_reactDom2['default'].findDOMNode(this)).find('.item__actions__action').first().focus();
			}

			//If return is pressed, navigate folder
			if (this.props.returnKey === event.keyCode) {
				this.onFileNavigate(event);
			}
		}
	}, {
		key: 'handleFocus',
		value: function handleFocus() {
			this.props.actions.setFocus(this.props.id);
		}
	}, {
		key: 'handleBlur',
		value: function handleBlur() {
			this.props.actions.setFocus(false);
		}
	}, {
		key: 'preventFocus',
		value: function preventFocus(event) {
			//To avoid browser's default focus state when selecting an item
			event.preventDefault();
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2['default'].createElement(
				'div',
				{ className: this.getItemClassNames(), 'data-id': this.props.id, onDoubleClick: this.handleDoubleClick },
				_react2['default'].createElement(
					'div',
					{ ref: 'thumbnail', className: this.getThumbnailClassNames(), tabIndex: '0', onKeyDown: this.handleKeyDown, style: this.getThumbnailStyles(), onClick: this.onFileSelect, onMouseDown: this.preventFocus },
					_react2['default'].createElement(
						'div',
						{ className: 'item__actions' },
						_react2['default'].createElement('button', {
							className: 'item__actions__action item__actions__action--select [ font-icon-tick ]',
							type: 'button',
							title: _i18n2['default']._t('AssetGalleryField.SELECT'),
							tabIndex: this.getButtonTabIndex(),
							onClick: this.onFileSelect,
							onFocus: this.handleFocus,
							onBlur: this.handleBlur }),
						_react2['default'].createElement('button', {
							className: 'item__actions__action item__actions__action--remove [ font-icon-trash ]',
							type: 'button',
							title: _i18n2['default']._t('AssetGalleryField.DELETE'),
							tabIndex: this.getButtonTabIndex(),
							onClick: this.onFileDelete,
							onFocus: this.handleFocus,
							onBlur: this.handleBlur }),
						_react2['default'].createElement('button', {
							className: 'item__actions__action item__actions__action--edit [ font-icon-edit ]',
							type: 'button',
							title: _i18n2['default']._t('AssetGalleryField.EDIT'),
							tabIndex: this.getButtonTabIndex(),
							onClick: this.onFileEdit,
							onFocus: this.handleFocus,
							onBlur: this.handleBlur })
					)
				),
				_react2['default'].createElement(
					'p',
					{ className: 'item__title', ref: 'title' },
					this.props.title
				)
			);
		}
	}]);

	return FileComponent;
})(_silverstripeComponent2['default']);

FileComponent.propTypes = {
	id: _react2['default'].PropTypes.number,
	title: _react2['default'].PropTypes.string,
	category: _react2['default'].PropTypes.string,
	url: _react2['default'].PropTypes.string,
	dimensions: _react2['default'].PropTypes.shape({
		width: _react2['default'].PropTypes.number,
		height: _react2['default'].PropTypes.number
	}),
	onFileNavigate: _react2['default'].PropTypes.func,
	onFileEdit: _react2['default'].PropTypes.func,
	onFileDelete: _react2['default'].PropTypes.func,
	spaceKey: _react2['default'].PropTypes.number,
	returnKey: _react2['default'].PropTypes.number,
	onFileSelect: _react2['default'].PropTypes.func,
	selected: _react2['default'].PropTypes.bool
};

function mapStateToProps(state) {
	return {
		gallery: state.assetAdmin.gallery
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: (0, _redux.bindActionCreators)(galleryActions, dispatch)
	};
}

exports['default'] = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(FileComponent);
module.exports = exports['default'];

},{"../../constants":6,"../../state/gallery/actions":11,"i18n":"i18n","jQuery":"jQuery","react":"react","react-dom":"react-dom","react-redux":"react-redux","redux":"redux","silverstripe-component":"silverstripe-component"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var TextFieldComponent = (function (_SilverStripeComponent) {
    _inherits(TextFieldComponent, _SilverStripeComponent);

    function TextFieldComponent(props) {
        _classCallCheck(this, TextFieldComponent);

        _get(Object.getPrototypeOf(TextFieldComponent.prototype), 'constructor', this).call(this, props);

        this.handleChange = this.handleChange.bind(this);
    }

    _createClass(TextFieldComponent, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'div',
                { className: 'field text' },
                _react2['default'].createElement(
                    'label',
                    { className: 'left', htmlFor: 'gallery_' + this.props.name },
                    this.props.label
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'middleColumn' },
                    _react2['default'].createElement('input', {
                        id: 'gallery_' + this.props.name,
                        className: 'text',
                        type: 'text',
                        name: this.props.name,
                        onChange: this.handleChange,
                        value: this.props.value })
                )
            );
        }
    }, {
        key: 'handleChange',
        value: function handleChange(event) {
            this.props.onChange();
        }
    }]);

    return TextFieldComponent;
})(_silverstripeComponent2['default']);

exports['default'] = TextFieldComponent;

TextFieldComponent.propTypes = {
    label: _react2['default'].PropTypes.string.isRequired,
    name: _react2['default'].PropTypes.string.isRequired,
    value: _react2['default'].PropTypes.string.isRequired,
    onChange: _react2['default'].PropTypes.func.isRequired
};
module.exports = exports['default'];

},{"react":"react","silverstripe-component":"silverstripe-component"}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

exports['default'] = {
	'THUMBNAIL_HEIGHT': 150,
	'THUMBNAIL_WIDTH': 200,
	'SPACE_KEY_CODE': 32,
	'RETURN_KEY_CODE': 13,
	'BULK_ACTIONS': [{
		value: 'delete',
		label: _i18n2['default']._t('AssetGalleryField.BULK_ACTIONS_DELETE'),
		destructive: true
	}],
	'BULK_ACTIONS_PLACEHOLDER': _i18n2['default']._t('AssetGalleryField.BULK_ACTIONS_PLACEHOLDER')
};
module.exports = exports['default'];

},{"i18n":"i18n"}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _stateGalleryActions = require('../../state/gallery/actions');

var galleryActions = _interopRequireWildcard(_stateGalleryActions);

var _componentsTextFieldIndex = require('../../components/text-field/index');

var _componentsTextFieldIndex2 = _interopRequireDefault(_componentsTextFieldIndex);

var EditorContainer = (function (_SilverStripeComponent) {
	_inherits(EditorContainer, _SilverStripeComponent);

	function EditorContainer(props) {
		_classCallCheck(this, EditorContainer);

		_get(Object.getPrototypeOf(EditorContainer.prototype), 'constructor', this).call(this, props);

		this.fields = [{
			'label': 'Title',
			'name': 'title',
			'value': this.props.file.title
		}, {
			'label': 'Filename',
			'name': 'basename',
			'value': this.props.file.basename
		}];

		this.onFieldChange = this.onFieldChange.bind(this);
		this.onFileSave = this.onFileSave.bind(this);
		this.onCancel = this.onCancel.bind(this);
	}

	_createClass(EditorContainer, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			_get(Object.getPrototypeOf(EditorContainer.prototype), 'componentDidMount', this).call(this);

			this.props.actions.setEditorFields(this.fields);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			_get(Object.getPrototypeOf(EditorContainer.prototype), 'componentWillUnmount', this).call(this);

			this.props.actions.setEditorFields();
		}
	}, {
		key: 'onFieldChange',
		value: function onFieldChange(event) {
			this.props.actions.updateEditorField({
				name: event.target.name,
				value: event.target.value
			});
		}
	}, {
		key: 'onFileSave',
		value: function onFileSave(event) {
			this.props.onFileSave(this.props.file.id, this.props.gallery.editorFields, event);
		}
	}, {
		key: 'onCancel',
		value: function onCancel(event) {
			this.props.actions.setEditing(false);
		}
	}, {
		key: 'render',
		value: function render() {
			var _this = this;

			return _react2['default'].createElement(
				'div',
				{ className: 'editor' },
				_react2['default'].createElement(
					'div',
					{ className: 'CompositeField composite cms-file-info nolabel' },
					_react2['default'].createElement(
						'div',
						{ className: 'CompositeField composite cms-file-info-preview nolabel' },
						_react2['default'].createElement('img', { className: 'thumbnail-preview', src: this.props.file.url })
					),
					_react2['default'].createElement(
						'div',
						{ className: 'CompositeField composite cms-file-info-data nolabel' },
						_react2['default'].createElement(
							'div',
							{ className: 'CompositeField composite nolabel' },
							_react2['default'].createElement(
								'div',
								{ className: 'field readonly' },
								_react2['default'].createElement(
									'label',
									{ className: 'left' },
									_i18n2['default']._t('AssetGalleryField.TYPE'),
									':'
								),
								_react2['default'].createElement(
									'div',
									{ className: 'middleColumn' },
									_react2['default'].createElement(
										'span',
										{ className: 'readonly' },
										this.props.file.type
									)
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.SIZE'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									this.props.file.size
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.URL'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									_react2['default'].createElement(
										'a',
										{ href: this.props.file.url, target: '_blank' },
										this.props.file.url
									)
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field date_disabled readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.CREATED'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									this.props.file.created
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field date_disabled readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.LASTEDIT'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									this.props.file.lastUpdated
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.DIM'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									this.props.file.attributes.dimensions.width,
									' x ',
									this.props.file.attributes.dimensions.height,
									'px'
								)
							)
						)
					)
				),
				this.props.gallery.editorFields.map(function (field, i) {
					return _react2['default'].createElement(_componentsTextFieldIndex2['default'], {
						key: i,
						label: field.label,
						name: field.name,
						value: field.value,
						onChange: _this.onFieldChange });
				}),
				_react2['default'].createElement(
					'div',
					null,
					_react2['default'].createElement(
						'button',
						{
							type: 'submit',
							className: 'ss-ui-button ui-button ui-widget ui-state-default ui-corner-all font-icon-check-mark',
							onClick: this.onFileSave },
						_i18n2['default']._t('AssetGalleryField.SAVE')
					),
					_react2['default'].createElement(
						'button',
						{
							type: 'button',
							className: 'ss-ui-button ui-button ui-widget ui-state-default ui-corner-all font-icon-cancel-circled',
							onClick: this.onCancel },
						_i18n2['default']._t('AssetGalleryField.CANCEL')
					)
				)
			);
		}
	}]);

	return EditorContainer;
})(_silverstripeComponent2['default']);

EditorContainer.propTypes = {
	file: _react2['default'].PropTypes.shape({
		id: _react2['default'].PropTypes.number,
		title: _react2['default'].PropTypes.string,
		basename: _react2['default'].PropTypes.string,
		url: _react2['default'].PropTypes.string,
		size: _react2['default'].PropTypes.string,
		created: _react2['default'].PropTypes.string,
		lastUpdated: _react2['default'].PropTypes.string,
		dimensions: _react2['default'].PropTypes.shape({
			width: _react2['default'].PropTypes.number,
			height: _react2['default'].PropTypes.number
		})
	}),
	onFileSave: _react2['default'].PropTypes.func,
	onCancel: _react2['default'].PropTypes.func
};

function mapStateToProps(state) {
	return {
		gallery: state.assetAdmin.gallery
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: (0, _redux.bindActionCreators)(galleryActions, dispatch)
	};
}

exports['default'] = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(EditorContainer);
module.exports = exports['default'];

},{"../../components/text-field/index":5,"../../state/gallery/actions":11,"i18n":"i18n","jQuery":"jQuery","react":"react","react-redux":"react-redux","redux":"redux","silverstripe-component":"silverstripe-component"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _componentsFileIndex = require('../../components/file/index');

var _componentsFileIndex2 = _interopRequireDefault(_componentsFileIndex);

var _editorControllerJs = require('../editor/controller.js');

var _editorControllerJs2 = _interopRequireDefault(_editorControllerJs);

var _componentsBulkActionsIndex = require('../../components/bulk-actions/index');

var _componentsBulkActionsIndex2 = _interopRequireDefault(_componentsBulkActionsIndex);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _stateGalleryActions = require('../../state/gallery/actions');

var galleryActions = _interopRequireWildcard(_stateGalleryActions);

function getComparator(field, direction) {
	return function (a, b) {
		if (direction === 'asc') {
			if (a[field] < b[field]) {
				return -1;
			}

			if (a[field] > b[field]) {
				return 1;
			}
		} else {
			if (a[field] > b[field]) {
				return -1;
			}

			if (a[field] < b[field]) {
				return 1;
			}
		}

		return 0;
	};
}

function getSort(field, direction) {
	var _this = this;

	var comparator = getComparator(field, direction);

	return function () {
		var folders = _this.props.gallery.files.filter(function (file) {
			return file.type === 'folder';
		});
		var files = _this.props.gallery.files.filter(function (file) {
			return file.type !== 'folder';
		});

		_this.props.actions.addFile(folders.sort(comparator).concat(files.sort(comparator)));
	};
}

var GalleryContainer = (function (_SilverStripeComponent) {
	_inherits(GalleryContainer, _SilverStripeComponent);

	function GalleryContainer(props) {
		_classCallCheck(this, GalleryContainer);

		_get(Object.getPrototypeOf(GalleryContainer.prototype), 'constructor', this).call(this, props);

		this.folders = [props.initial_folder];

		this.sort = 'name';
		this.direction = 'asc';

		this.sorters = [{
			'field': 'title',
			'direction': 'asc',
			'label': _i18n2['default']._t('AssetGalleryField.FILTER_TITLE_ASC'),
			'onSort': getSort.call(this, 'title', 'asc')
		}, {
			'field': 'title',
			'direction': 'desc',
			'label': _i18n2['default']._t('AssetGalleryField.FILTER_TITLE_DESC'),
			'onSort': getSort.call(this, 'title', 'desc')
		}, {
			'field': 'created',
			'direction': 'desc',
			'label': _i18n2['default']._t('AssetGalleryField.FILTER_DATE_DESC'),
			'onSort': getSort.call(this, 'created', 'desc')
		}, {
			'field': 'created',
			'direction': 'asc',
			'label': _i18n2['default']._t('AssetGalleryField.FILTER_DATE_ASC'),
			'onSort': getSort.call(this, 'created', 'asc')
		}];

		// Backend event listeners
		this.onFetchData = this.onFetchData.bind(this);
		this.onSaveData = this.onSaveData.bind(this);
		this.onDeleteData = this.onDeleteData.bind(this);
		this.onNavigateData = this.onNavigateData.bind(this);
		this.onMoreData = this.onMoreData.bind(this);
		this.onSearchData = this.onSearchData.bind(this);

		// User event listeners
		this.onFileSave = this.onFileSave.bind(this);
		this.onFileNavigate = this.onFileNavigate.bind(this);
		this.onFileDelete = this.onFileDelete.bind(this);
		this.onBackClick = this.onBackClick.bind(this);
		this.onMoreClick = this.onMoreClick.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	_createClass(GalleryContainer, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			_get(Object.getPrototypeOf(GalleryContainer.prototype), 'componentDidMount', this).call(this);

			if (this.props.initial_folder !== this.props.current_folder) {
				this.onNavigate(this.props.current_folder);
			} else {
				this.props.backend.search();
			}

			this.props.backend.on('onFetchData', this.onFetchData);
			this.props.backend.on('onSaveData', this.onSaveData);
			this.props.backend.on('onDeleteData', this.onDeleteData);
			this.props.backend.on('onNavigateData', this.onNavigateData);
			this.props.backend.on('onMoreData', this.onMoreData);
			this.props.backend.on('onSearchData', this.onSearchData);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			_get(Object.getPrototypeOf(GalleryContainer.prototype), 'componentWillUnmount', this).call(this);

			this.props.backend.removeListener('onFetchData', this.onFetchData);
			this.props.backend.removeListener('onSaveData', this.onSaveData);
			this.props.backend.removeListener('onDeleteData', this.onDeleteData);
			this.props.backend.removeListener('onNavigateData', this.onNavigateData);
			this.props.backend.removeListener('onMoreData', this.onMoreData);
			this.props.backend.removeListener('onSearchData', this.onSearchData);
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			var $select = (0, _jQuery2['default'])(_reactDom2['default'].findDOMNode(this)).find('.gallery__sort .dropdown');

			// We opt-out of letting the CMS handle Chosen because it doesn't re-apply the behaviour correctly.
			// So after the gallery has been rendered we apply Chosen.
			$select.chosen({
				'allow_single_deselect': true,
				'disable_search_threshold': 20
			});

			// Chosen stops the change event from reaching React so we have to simulate a click.
			$select.change(function () {
				return _reactAddonsTestUtils2['default'].Simulate.click($select.find(':selected')[0]);
			});
		}
	}, {
		key: 'getFileById',
		value: function getFileById(id) {
			var folder = null;

			for (var i = 0; i < this.props.gallery.files.length; i += 1) {
				if (this.props.gallery.files[i].id === id) {
					folder = this.props.gallery.files[i];
					break;
				}
			}

			return folder;
		}
	}, {
		key: 'getNoItemsNotice',
		value: function getNoItemsNotice() {
			if (this.props.gallery.count < 1) {
				return _react2['default'].createElement(
					'p',
					{ className: 'gallery__no-item-notice' },
					_i18n2['default']._t('AssetGalleryField.NOITEMSFOUND')
				);
			}

			return null;
		}
	}, {
		key: 'getBackButton',
		value: function getBackButton() {
			if (this.folders.length > 1) {
				return _react2['default'].createElement('button', {
					className: 'gallery__back ss-ui-button ui-button ui-widget ui-state-default ui-corner-all font-icon-level-up no-text',
					onClick: this.onBackClick,
					ref: 'backButton' });
			}

			return null;
		}
	}, {
		key: 'getBulkActionsComponent',
		value: function getBulkActionsComponent() {
			if (this.props.gallery.selectedFiles.length > 0 && this.props.backend.bulkActions) {
				return _react2['default'].createElement(_componentsBulkActionsIndex2['default'], {
					backend: this.props.backend });
			}

			return null;
		}
	}, {
		key: 'getMoreButton',
		value: function getMoreButton() {
			if (this.props.gallery.count > this.props.gallery.files.length) {
				return _react2['default'].createElement(
					'button',
					{
						className: 'gallery__load__more',
						onClick: this.onMoreClick },
					_i18n2['default']._t('AssetGalleryField.LOADMORE')
				);
			}

			return null;
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			if (this.props.gallery.editing !== false) {
				return _react2['default'].createElement(
					'div',
					{ className: 'gallery' },
					_react2['default'].createElement(_editorControllerJs2['default'], {
						file: this.props.gallery.editing,
						onFileSave: this.onFileSave,
						onCancel: this.onCancel })
				);
			}

			return _react2['default'].createElement(
				'div',
				{ className: 'gallery' },
				this.getBackButton(),
				this.getBulkActionsComponent(),
				_react2['default'].createElement(
					'div',
					{ className: 'gallery__sort fieldholder-small' },
					_react2['default'].createElement(
						'select',
						{ className: 'dropdown no-change-track no-chzn', tabIndex: '0', style: { width: '160px' } },
						this.sorters.map(function (sorter, i) {
							return _react2['default'].createElement(
								'option',
								{ key: i, onClick: sorter.onSort },
								sorter.label
							);
						})
					)
				),
				_react2['default'].createElement(
					'div',
					{ className: 'gallery__items' },
					this.props.gallery.files.map(function (file, i) {
						return _react2['default'].createElement(_componentsFileIndex2['default'], _extends({ key: i }, file, {
							spaceKey: _constants2['default'].SPACE_KEY_CODE,
							returnKey: _constants2['default'].RETURN_KEY_CODE,
							onFileDelete: _this2.onFileDelete,
							onFileNavigate: _this2.onFileNavigate }));
					})
				),
				this.getNoItemsNotice(),
				_react2['default'].createElement(
					'div',
					{ className: 'gallery__load' },
					this.getMoreButton()
				)
			);
		}
	}, {
		key: 'onFetchData',
		value: function onFetchData(data) {
			this.props.actions.addFile(data.files, data.count);
		}
	}, {
		key: 'onSaveData',
		value: function onSaveData(id, values) {
			this.props.actions.setEditing(false);
			this.props.actions.updateFile(id, { title: values.title, basename: values.basename });
		}
	}, {
		key: 'onDeleteData',
		value: function onDeleteData(data) {
			var files = this.props.gallery.files.filter(function (file) {
				return data !== file.id;
			});

			this.props.actions.addFile(files, this.props.gallery.count - 1);
		}
	}, {
		key: 'onNavigateData',
		value: function onNavigateData(data) {
			this.props.actions.addFile(data.files, data.count);
		}
	}, {
		key: 'onMoreData',
		value: function onMoreData(data) {
			this.props.actions.addFile(this.props.gallery.files.concat(data.files), data.count);
		}
	}, {
		key: 'onSearchData',
		value: function onSearchData(data) {
			this.props.actions.addFile(data.files, data.count);
		}
	}, {
		key: 'onFileDelete',
		value: function onFileDelete(file, event) {
			if (confirm(_i18n2['default']._t('AssetGalleryField.CONFIRMDELETE'))) {
				this.props.backend['delete'](file.id);
				this.emitFileDeletedCmsEvent();
			}

			event.stopPropagation();
		}
	}, {
		key: 'onFileNavigate',
		value: function onFileNavigate(file) {
			this.folders.push(file.filename);
			this.props.backend.navigate(file.filename);

			this.props.actions.deselectFiles();

			this.emitFolderChangedCmsEvent();
		}
	}, {
		key: 'emitFolderChangedCmsEvent',
		value: function emitFolderChangedCmsEvent() {
			var folder = {
				parentId: 0,
				id: 0
			};

			// The current folder is stored by it's name in our component.
			// We need to get it's id because that's how Entwine components (GridField) reference it.
			for (var i = 0; i < this.props.gallery.files.length; i += 1) {
				if (this.props.gallery.files[i].filename === this.props.backend.folder) {
					folder.parentId = this.props.gallery.files[i].parent.id;
					folder.id = this.props.gallery.files[i].id;
					break;
				}
			}

			this._emitCmsEvent('folder-changed.asset-gallery-field', folder);
		}
	}, {
		key: 'emitFileDeletedCmsEvent',
		value: function emitFileDeletedCmsEvent() {
			this._emitCmsEvent('file-deleted.asset-gallery-field');
		}
	}, {
		key: 'emitEnterFileViewCmsEvent',
		value: function emitEnterFileViewCmsEvent(file) {
			var id = 0;

			this._emitCmsEvent('enter-file-view.asset-gallery-field', file.id);
		}
	}, {
		key: 'emitExitFileViewCmsEvent',
		value: function emitExitFileViewCmsEvent() {
			this._emitCmsEvent('exit-file-view.asset-gallery-field');
		}
	}, {
		key: 'onNavigate',
		value: function onNavigate(folder) {
			var silent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			// Don't the folder if it exists already.
			if (this.folders.indexOf(folder) === -1) {
				this.folders.push(folder);
			}

			this.props.backend.navigate(folder);

			if (!silent) {
				this.emitFolderChangedCmsEvent();
			}
		}
	}, {
		key: 'onMoreClick',
		value: function onMoreClick(event) {
			event.stopPropagation();

			this.props.backend.more();

			event.preventDefault();
		}
	}, {
		key: 'onBackClick',
		value: function onBackClick(event) {
			if (this.folders.length > 1) {
				this.folders.pop();
				this.props.backend.navigate(this.folders[this.folders.length - 1]);
			}

			this.props.actions.deselectFiles();

			this.emitFolderChangedCmsEvent();

			event.preventDefault();
		}
	}, {
		key: 'onFileSave',
		value: function onFileSave(id, state, event) {
			this.props.backend.save(id, state);

			event.stopPropagation();
			event.preventDefault();
		}
	}]);

	return GalleryContainer;
})(_silverstripeComponent2['default']);

GalleryContainer.propTypes = {
	backend: _react2['default'].PropTypes.object.isRequired
};

function mapStateToProps(state) {
	return {
		gallery: state.assetAdmin.gallery
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: (0, _redux.bindActionCreators)(galleryActions, dispatch)
	};
}

exports['default'] = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(GalleryContainer);
module.exports = exports['default'];

},{"../../components/bulk-actions/index":3,"../../components/file/index":4,"../../constants":6,"../../state/gallery/actions":11,"../editor/controller.js":7,"i18n":"i18n","jQuery":"jQuery","react":"react","react-addons-test-utils":"react-addons-test-utils","react-dom":"react-dom","react-redux":"react-redux","redux":"redux","silverstripe-component":"silverstripe-component"}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var GALLERY = {
    ADD_FILE: 'ADD_FILE',
    UPDATE_FILE: 'UPDATE_FILE',
    SELECT_FILES: 'SELECT_FILES',
    DESELECT_FILES: 'DESELECT_FILES',
    SET_EDITING: 'SET_EDITING',
    SET_FOCUS: 'SET_FOCUS',
    SET_EDITOR_FIELDS: 'SET_EDITOR_FIELDS',
    UPDATE_EDITOR_FIELD: 'UPDATE_EDITOR_FIELD'
};
exports.GALLERY = GALLERY;

},{}],10:[function(require,module,exports){
/**
 * @file Factory for creating a Redux store.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = configureStore;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

// Used for handling async store updates.

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

// Logs state changes to the console. Useful for debugging.

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

/**
 * @func createStoreWithMiddleware
 * @param function rootReducer
 * @param object initialState
 * @desc Creates a Redux store with some middleware applied.
 * @private
 */
var createStoreWithMiddleware = (0, _redux.applyMiddleware)(_reduxThunk2['default'], (0, _reduxLogger2['default'])())(_redux.createStore);

/**
 * @func configureStore
 * @param object initialState
 * @return object - A Redux store that lets you read the state, dispatch actions and subscribe to changes.
 */

function configureStore() {
  var initialState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var store = createStoreWithMiddleware(_reducer2['default'], initialState);

  return store;
}

;
module.exports = exports['default'];

},{"./reducer":13,"redux":"redux","redux-logger":16,"redux-thunk":"redux-thunk"}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.addFile = addFile;
exports.updateFile = updateFile;
exports.selectFiles = selectFiles;
exports.deselectFiles = deselectFiles;
exports.setEditing = setEditing;
exports.setFocus = setFocus;
exports.setEditorFields = setEditorFields;
exports.updateEditorField = updateEditorField;

var _actionTypes = require('../action-types');

/**
 * Adds a file to state.
 *
 * @param object|array file - File object or array of file objects.
 * @param number [count] - The number of files in the current view.
 */

function addFile(file, count) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.ADD_FILE,
            payload: { file: file, count: count }
        });
    };
}

/**
 * Updates a file with new data.
 *
 * @param number id - The id of the file to update.
 * @param object updates - The new values.
 */

function updateFile(id, updates) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.UPDATE_FILE,
            payload: { id: id, updates: updates }
        });
    };
}

/**
 * Selects a file or files. If no param is passed all files are selected.
 *
 * @param number|array ids - File id or array of file ids to select.
 */

function selectFiles() {
    var ids = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.SELECT_FILES,
            payload: { ids: ids }
        });
    };
}

/**
 * Deselects a file or files. If no param is passed all files are deselected.
 *
 * @param number|array ids - File id or array of file ids to deselect.
 */

function deselectFiles() {
    var ids = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.DESELECT_FILES,
            payload: { ids: ids }
        });
    };
}

/**
 * Starts editing the given file or stops editing if false is given.
 *
 * @param object|boolean file - The file to edit.
 */

function setEditing(file) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.SET_EDITING,
            payload: { file: file }
        });
    };
}

/**
 * Sets the focus state of a file.
 *
 * @param number|boolean id - the id of the file to focus on, or false.
 */

function setFocus(id) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.SET_FOCUS,
            payload: {
                id: id
            }
        });
    };
}

/**
 * Sets the state of the fields for the editor component.
 *
 * @param object editorFields - the current fields in the editor component
 */

function setEditorFields() {
    var editorFields = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.SET_EDITOR_FIELDS,
            payload: { editorFields: editorFields }
        });
    };
}

/**
 * Update the value of the given field.
 *
 * @param object updates - The values to update the editor field with.
 * @param string updates.name - The editor field name.
 * @param string updates.value - The new value of the field.
 * @param string [updates.label] - The field label.
 */

function updateEditorField(updates) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.UPDATE_EDITOR_FIELD,
            payload: { updates: updates }
        });
    };
}

},{"../action-types":9}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = galleryReducer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _deepFreeze = require('deep-freeze');

var _deepFreeze2 = _interopRequireDefault(_deepFreeze);

var _actionTypes = require('../action-types');

var _constantsJs = require('../../constants.js');

var _constantsJs2 = _interopRequireDefault(_constantsJs);

var initialState = {
    count: 0, // The number of files in the current view
    editing: false,
    files: [],
    selectedFiles: [],
    editing: false,
    focus: false,
    bulkActions: {
        placeholder: _constantsJs2['default'].BULK_ACTIONS_PLACEHOLDER,
        options: _constantsJs2['default'].BULK_ACTIONS
    },
    editorFields: []
};

/**
 * Reducer for the `assetAdmin.gallery` state key.
 *
 * @param object state
 * @param object action - The dispatched action.
 * @param string action.type - Name of the dispatched action.
 * @param object [action.payload] - Optional data passed with the action.
 */

function galleryReducer(state, action) {
    if (state === undefined) state = initialState;

    var nextState;

    switch (action.type) {
        case _actionTypes.GALLERY.ADD_FILE:
            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                count: action.payload.count !== 'undefined' ? action.payload.count : state.count,
                files: state.files.concat(action.payload.file)
            }));

        case _actionTypes.GALLERY.UPDATE_FILE:
            var fileIndex = state.files.map(function (file) {
                return file.id;
            }).indexOf(action.payload.id);
            var updatedFile = Object.assign({}, state.files[fileIndex], action.payload.updates);

            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                files: state.files.map(function (file) {
                    return file.id === updatedFile.id ? updatedFile : file;
                })
            }));

        case _actionTypes.GALLERY.SELECT_FILES:
            if (action.payload.ids === null) {
                // No param was passed, add everything that isn't currently selected, to the selectedFiles array.
                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                    selectedFiles: state.selectedFiles.concat(state.files.map(function (file) {
                        return file.id;
                    }).filter(function (id) {
                        return state.selectedFiles.indexOf(id) === -1;
                    }))
                }));
            } else if (typeof action.payload.ids === 'number') {
                // We're dealing with a single id to select.
                // Add the file if it's not already selected.
                if (state.selectedFiles.indexOf(action.payload.ids) === -1) {
                    nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                        selectedFiles: state.selectedFiles.concat(action.payload.ids)
                    }));
                } else {
                    // The file is already selected, so return the current state.
                    nextState = state;
                }
            } else {
                // We're dealing with an array if ids to select.
                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                    selectedFiles: state.selectedFiles.concat(action.payload.ids.filter(function (id) {
                        return state.selectedFiles.indexOf(id) === -1;
                    }))
                }));
            }

            return nextState;

        case _actionTypes.GALLERY.DESELECT_FILES:
            if (action.payload.ids === null) {
                // No param was passed, deselect everything.
                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, { selectedFiles: [] }));
            } else if (typeof action.payload.ids === 'number') {
                // We're dealing with a single id to deselect.
                var _fileIndex = state.selectedFiles.indexOf(action.payload.ids);

                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                    selectedFiles: state.selectedFiles.slice(0, _fileIndex).concat(state.selectedFiles.slice(_fileIndex + 1))
                }));
            } else {
                // We're dealing with an array if ids to deselect.
                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                    selectedFiles: state.selectedFiles.filter(function (id) {
                        return action.payload.ids.indexOf(id) === -1;
                    })
                }));
            }

            return nextState;

        case _actionTypes.GALLERY.SET_EDITING:
            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                editing: action.payload.file
            }));

        case _actionTypes.GALLERY.SET_FOCUS:
            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                focus: action.payload.id
            }));

        case _actionTypes.GALLERY.SET_EDITOR_FIELDS:
            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                editorFields: action.payload.editorFields
            }));

        case _actionTypes.GALLERY.UPDATE_EDITOR_FIELD:
            var fieldIndex = state.editorFields.map(function (field) {
                return field.name;
            }).indexOf(action.payload.updates.name);
            var updatedField = Object.assign({}, state.editorFields[fieldIndex], action.payload.updates);

            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                editorFields: state.editorFields.map(function (field) {
                    return field.name === updatedField.name ? updatedField : field;
                })
            }));

        default:
            return state;
    }
}

module.exports = exports['default'];

},{"../../constants.js":6,"../action-types":9,"deep-freeze":15}],13:[function(require,module,exports){
/**
 * @file The reducer which operates on the Redux store.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _redux = require('redux');

var _galleryReducerJs = require('./gallery/reducer.js');

var _galleryReducerJs2 = _interopRequireDefault(_galleryReducerJs);

/**
 * Operates on the Redux store to update application state.
 *
 * @param object state - The current state.
 * @param object action - The dispatched action.
 * @param string action.type - The type of action that has been dispatched.
 * @param object [action.payload] - Optional data passed with the action.
 */
var rootReducer = (0, _redux.combineReducers)({
  assetAdmin: (0, _redux.combineReducers)({
    gallery: _galleryReducerJs2['default']
  })
});

exports['default'] = rootReducer;
module.exports = exports['default'];

},{"./gallery/reducer.js":12,"redux":"redux"}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],15:[function(require,module,exports){
module.exports = function deepFreeze (o) {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o.hasOwnProperty(prop)
    && o[prop] !== null
    && (typeof o[prop] === "object" || typeof o[prop] === "function")
    && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  
  return o;
};

},{}],16:[function(require,module,exports){
"use strict";

var repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};
var pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};
var formatTime = function formatTime(time) {
  return " @ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use the new performance api to get better precision if available
var timer = typeof performance !== "undefined" && typeof performance.now === "function" ? performance : Date;

/**
 * Creates logger with followed options
 *
 * @namespace
 * @property {object} options - options for logger
 * @property {string} options.level - console[level]
 * @property {boolean} options.duration - print duration of each action?
 * @property {boolean} options.timestamp - print timestamp with each action?
 * @property {object} options.colors - custom colors
 * @property {object} options.logger - implementation of the `console` API
 * @property {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @property {boolean} options.collapsed - is group collapsed?
 * @property {boolean} options.predicate - condition which resolves logger behavior
 * @property {function} options.stateTransformer - transform state before print
 * @property {function} options.actionTransformer - transform action before print
 * @property {function} options.errorTransformer - transform error before print
 */

function createLogger() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$level = options.level;
  var level = _options$level === undefined ? "log" : _options$level;
  var _options$logger = options.logger;
  var logger = _options$logger === undefined ? window.console : _options$logger;
  var _options$logErrors = options.logErrors;
  var logErrors = _options$logErrors === undefined ? true : _options$logErrors;
  var collapsed = options.collapsed;
  var predicate = options.predicate;
  var _options$duration = options.duration;
  var duration = _options$duration === undefined ? false : _options$duration;
  var _options$timestamp = options.timestamp;
  var timestamp = _options$timestamp === undefined ? true : _options$timestamp;
  var transformer = options.transformer;
  var _options$stateTransfo = options.stateTransformer;
  var // deprecated
  stateTransformer = _options$stateTransfo === undefined ? function (state) {
    return state;
  } : _options$stateTransfo;
  var _options$actionTransf = options.actionTransformer;
  var actionTransformer = _options$actionTransf === undefined ? function (actn) {
    return actn;
  } : _options$actionTransf;
  var _options$errorTransfo = options.errorTransformer;
  var errorTransformer = _options$errorTransfo === undefined ? function (error) {
    return error;
  } : _options$errorTransfo;
  var _options$colors = options.colors;
  var colors = _options$colors === undefined ? {
    title: function title() {
      return "#000000";
    },
    prevState: function prevState() {
      return "#9E9E9E";
    },
    action: function action() {
      return "#03A9F4";
    },
    nextState: function nextState() {
      return "#4CAF50";
    },
    error: function error() {
      return "#F20404";
    }
  } : _options$colors;

  // exit if console undefined

  if (typeof logger === "undefined") {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error("Option 'transformer' is deprecated, use stateTransformer instead");
  }

  var logBuffer = [];
  function printBuffer() {
    logBuffer.forEach(function (logEntry, key) {
      var started = logEntry.started;
      var action = logEntry.action;
      var prevState = logEntry.prevState;
      var error = logEntry.error;
      var took = logEntry.took;
      var nextState = logEntry.nextState;

      var nextEntry = logBuffer[key + 1];
      if (nextEntry) {
        nextState = nextEntry.prevState;
        took = nextEntry.started - started;
      }
      // message
      var formattedAction = actionTransformer(action);
      var time = new Date(started);
      var isCollapsed = typeof collapsed === "function" ? collapsed(function () {
        return nextState;
      }, action) : collapsed;

      var formattedTime = formatTime(time);
      var titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : null;
      var title = "action " + formattedAction.type + (timestamp ? formattedTime : "") + (duration ? " in " + took.toFixed(2) + " ms" : "");

      // render
      try {
        if (isCollapsed) {
          if (colors.title) logger.groupCollapsed("%c " + title, titleCSS);else logger.groupCollapsed(title);
        } else {
          if (colors.title) logger.group("%c " + title, titleCSS);else logger.group(title);
        }
      } catch (e) {
        logger.log(title);
      }

      if (colors.prevState) logger[level]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState);else logger[level]("prev state", prevState);

      if (colors.action) logger[level]("%c action", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction);else logger[level]("action", formattedAction);

      if (error) {
        if (colors.error) logger[level]("%c error", "color: " + colors.error(error, prevState) + "; font-weight: bold", error);else logger[level]("error", error);
      }

      if (colors.nextState) logger[level]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState);else logger[level]("next state", nextState);

      try {
        logger.groupEnd();
      } catch (e) {
        logger.log("—— log end ——");
      }
    });
    logBuffer.length = 0;
  }

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // exit early if predicate function returns false
        if (typeof predicate === "function" && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = timer.now();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = undefined;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        printBuffer();

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

module.exports = createLogger;
},{}]},{},[2]);
