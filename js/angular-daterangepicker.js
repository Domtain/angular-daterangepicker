(function() {
  (function() {
    var picker;
    picker = void 0;
    picker = angular.module('daterangepicker', []);
    picker.provider('dateRangePickerOptions', function() {
      var DefaultOptions, defaultOptions;
      DefaultOptions = void 0;
      defaultOptions = void 0;
      defaultOptions = {
        clearLabel: 'Clear',
        locale: {
          separator: ' - ',
          format: 'YYYY-MM-DD'
        }
      };
      DefaultOptions = function(options) {
        return defaultOptions = options;
      };
      this.setDefaultOptions = function(options) {
        defaultOptions = options;
      };
      this.$get = [
        function() {
          return DefaultOptions(defaultOptions);
        }
      ];
      return this;
    });
    picker.directive('dateRangePicker', [
      '$compile', '$timeout', '$parse', '$templateRequest', 'dateRangePickerOptions', function($compile, $timeout, $parse, $templateRequest, dateRangePickerOptions) {
        return {
          require: 'ngModel',
          restrict: 'A',
          scope: {
            min: '=',
            max: '=',
            model: '=ngModel',
            opts: '=options',
            clearable: '='
          },
          link: function($scope, element, attrs, modelCtrl) {
            var _clear, _init, _initBoundaryField, _mergeOpts, _picker, _setDatePoint, _setEndDate, _setStartDate, _validate, _validateMax, _validateMin, customOpts, defaultOpts, el, opts;
            _clear = void 0;
            _init = void 0;
            _initBoundaryField = void 0;
            _mergeOpts = void 0;
            _picker = void 0;
            _setDatePoint = void 0;
            _setEndDate = void 0;
            _setStartDate = void 0;
            _validate = void 0;
            _validateMax = void 0;
            _validateMin = void 0;
            customOpts = void 0;
            defaultOpts = void 0;
            el = void 0;
            opts = void 0;
            _mergeOpts = function() {
              var extend, localeExtend;
              extend = void 0;
              localeExtend = void 0;
              localeExtend = angular.extend.apply(angular, Array.prototype.slice.call(arguments).map(function(opt) {
                if (opt !== null) {
                  return opt.locale;
                } else {
                  return void 0;
                }
              }).filter(function(opt) {
                return !!opt;
              }));
              extend = angular.extend.apply(angular, arguments);
              extend.locale = localeExtend;
              return extend;
            };
            el = $(element);
            customOpts = $scope.opts;
            if (angular.isString(customOpts.templateUrl)) {
              $templateRequest(customOpts.templateUrl).then(function(html) {
                customOpts.template = html;
              });
            }
            defaultOpts = angular.copy(dateRangePickerOptions);
            opts = (customOpts !== null ? customOpts.locale : void 0) !== null ? _mergeOpts({}, defaultOpts, customOpts) : void 0;
            _mergeOpts({}, dateRangePickerOptions, customOpts);
            _picker = null;
            _clear = function() {
              _picker.setStartDate();
              return _picker.setEndDate();
            };
            _setDatePoint = function(setter) {
              return function(newValue) {
                if (_picker && newValue) {
                  return setter(moment(newValue));
                }
              };
            };
            _setStartDate = _setDatePoint(function(m) {
              if (_picker.endDate < m) {
                _picker.setEndDate(m);
              }
              opts.startDate = m;
              return _picker.setStartDate(m);
            });
            _setEndDate = _setDatePoint(function(m) {
              if (_picker.startDate > m) {
                _picker.setStartDate(m);
              }
              opts.endDate = m;
              return _picker.setEndDate(m);
            });
            _validate = function(validator) {
              return function(boundary, actual) {
                if (boundary && actual) {
                  return validator(moment(boundary), moment(actual));
                } else {
                  return true;
                }
              };
            };
            _validateMin = _validate(function(min, start) {
              return min.isBefore(start) || min.isSame(start, 'day');
            });
            _validateMax = _validate(function(max, end) {
              return max.isAfter(end) || max.isSame(end, 'day');
            });
            modelCtrl.$formatters.push(function(objValue) {
              var f;
              f = void 0;
              f = function(date) {
                if (!moment.isMoment(date)) {
                  return moment(date).format(opts.locale.format);
                } else {
                  return date.format(opts.locale.format);
                }
              };
              if (opts.singleDatePicker && objValue) {
                return f(objValue);
              } else if (objValue && objValue.startDate) {
                return [f(objValue.startDate), f(objValue.endDate)].join(opts.locale.separator);
              } else {
                return '';
              }
            });
            modelCtrl.$render = function() {
              if (modelCtrl.$modelValue && modelCtrl.$modelValue.startDate) {
                _setStartDate(modelCtrl.$modelValue.startDate);
                _setEndDate(modelCtrl.$modelValue.endDate);
              } else {
                _clear();
              }
              return el.val(modelCtrl.$viewValue);
            };
            modelCtrl.$parsers.push(function(val) {
              var f, objValue, x;
              f = void 0;
              objValue = void 0;
              x = void 0;
              f = function(value) {
                return moment(value, opts.locale.format);
              };
              objValue = {
                startDate: null,
                endDate: null
              };
              if (angular.isString(val) && val.length > 0) {
                if (opts.singleDatePicker) {
                  objValue = f(val);
                } else {
                  x = val.split(opts.locale.separator).map(f);
                  objValue.startDate = x[0];
                  objValue.endDate = x[1];
                }
              }
              return objValue;
            });
            modelCtrl.$isEmpty = function(val) {
              return !(angular.isString(val) && val.length > 0);
            };
            _init = function() {
              var eventType, results;
              eventType = void 0;
              results = void 0;
              el.daterangepicker(angular.extend(opts, {
                autoUpdateInput: false
              }), function(start, end) {
                return $scope.$apply(function() {
                  return $scope.model = opts.singleDatePicker ? start : {
                    startDate: start,
                    endDate: end
                  };
                });
              });
              _picker = el.data('daterangepicker');
              results = [];
              for (eventType in opts.eventHandlers) {
                results.push(el.on(eventType, function(e) {
                  var eventName;
                  eventName = void 0;
                  eventName = e.type + '.' + e.namespace;
                  return $scope.$evalAsync(opts.eventHandlers[eventName]);
                }));
              }
              return results;
            };
            _init();
            $scope.$watch('model.startDate', function(n) {
              return _setStartDate(n);
            });
            $scope.$watch('model.endDate', function(n) {
              return _setEndDate(n);
            });
            _initBoundaryField = function(field, validator, modelField, optName) {
              if (attrs[field]) {
                modelCtrl.$validators[field] = function(value) {
                  return value && validator(opts[optName], value[modelField]);
                };
                return $scope.$watch(field, function(date) {
                  opts[optName] = date ? moment(date) : false;
                  return _init();
                });
              }
            };
            _initBoundaryField('min', _validateMin, 'startDate', 'minDate');
            _initBoundaryField('max', _validateMax, 'endDate', 'maxDate');
            if (attrs.options) {
              $scope.$watch('opts', (function(newOpts) {
                opts = _mergeOpts(opts, newOpts);
                return _init();
              }), true);
            }
            if (attrs.clearable) {
              $scope.$watch('clearable', function(newClearable) {
                if (newClearable) {
                  opts = _mergeOpts(opts, {
                    locale: {
                      cancelLabel: opts.clearLabel
                    }
                  });
                }
                _init();
                if (newClearable) {
                  return el.on('cancel.daterangepicker', function() {
                    return $scope.$apply(function() {
                      return $scope.model = opts.singleDatePicker ? null : {
                        startDate: null,
                        endDate: null
                      };
                    });
                  });
                }
              });
            }
            return $scope.$on('$destroy', function() {
              if (_picker !== null) {
                return _picker.remove();
              } else {
                return void 0;
              }
            });
          }
        };
      }
    ]);
  }).call(this);

}).call(this);
