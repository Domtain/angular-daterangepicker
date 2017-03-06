(->
  picker = undefined
  picker = angular.module('daterangepicker', [])
  picker.provider 'dateRangePickerOptions', ->
    DefaultOptions = undefined
    defaultOptions = undefined
    defaultOptions =
      clearLabel: 'Clear'
      locale:
        separator: ' - '
        format: 'YYYY-MM-DD'

    DefaultOptions = (options) ->
      defaultOptions = options

    @setDefaultOptions = (options) ->
      defaultOptions = options
      return

    @$get = [->
      DefaultOptions defaultOptions
    ]
    this
  picker.directive 'dateRangePicker', [
    '$compile'
    '$timeout'
    '$parse'
    '$templateRequest'
    'dateRangePickerOptions'
    ($compile, $timeout, $parse, $templateRequest, dateRangePickerOptions) ->
      {
        require: 'ngModel'
        restrict: 'A'
        scope:
          min: '='
          max: '='
          model: '=ngModel'
          opts: '=options'
          clearable: '='
        link: ($scope, element, attrs, modelCtrl) ->
          _clear = undefined
          _init = undefined
          _initBoundaryField = undefined
          _mergeOpts = undefined
          _picker = undefined
          _setDatePoint = undefined
          _setEndDate = undefined
          _setStartDate = undefined
          _validate = undefined
          _validateMax = undefined
          _validateMin = undefined
          customOpts = undefined
          defaultOpts = undefined
          el = undefined
          opts = undefined

          _mergeOpts = ->
            extend = undefined
            localeExtend = undefined
            localeExtend = angular.extend.apply(angular, Array::slice.call(arguments).map((opt) ->
              if opt != null then opt.locale else undefined
            ).filter((opt) ->
              !!opt
            ))
            extend = angular.extend.apply(angular, arguments)
            extend.locale = localeExtend
            extend

          el = $(element)
          customOpts = $scope.opts
          if angular.isString(customOpts.templateUrl)
            $templateRequest(customOpts.templateUrl).then (html) ->
              customOpts.template = html
              return
          defaultOpts = angular.copy(dateRangePickerOptions)
          opts = if (if customOpts != null then customOpts.locale else undefined) != null then _mergeOpts({},
            defaultOpts, customOpts)
          else
          _mergeOpts({}, dateRangePickerOptions, customOpts)
          _picker = null

          _clear = ->
            _picker.setStartDate()
            _picker.setEndDate()

          _setDatePoint = (setter) ->
            (newValue) ->
              if _picker and newValue
                return setter(moment(newValue))
              return

          _setStartDate = _setDatePoint((m) ->
            if _picker.endDate < m
              _picker.setEndDate m
            opts.startDate = m
            _picker.setStartDate m
          )
          _setEndDate = _setDatePoint((m) ->
            if _picker.startDate > m
              _picker.setStartDate m
            opts.endDate = m
            _picker.setEndDate m
          )

          _validate = (validator) ->
            (boundary, actual) ->
              if boundary and actual
                validator moment(boundary), moment(actual)
              else
                true

          _validateMin = _validate((min, start) ->
            min.isBefore(start) or min.isSame(start, 'day')
          )
          _validateMax = _validate((max, end) ->
            max.isAfter(end) or max.isSame(end, 'day')
          )
          modelCtrl.$formatters.push (objValue) ->
            f = undefined

            f = (date) ->
              if !moment.isMoment(date)
                moment(date).format opts.locale.format
              else
                date.format opts.locale.format

            if opts.singleDatePicker and objValue
              f objValue
            else if objValue and objValue.startDate
              [
                f(objValue.startDate)
                f(objValue.endDate)
              ].join opts.locale.separator
            else
              ''

          modelCtrl.$render = ->
            if modelCtrl.$modelValue and modelCtrl.$modelValue.startDate
              _setStartDate modelCtrl.$modelValue.startDate
              _setEndDate modelCtrl.$modelValue.endDate
            else
              _clear()
            el.val modelCtrl.$viewValue

          modelCtrl.$parsers.push (val) ->
            f = undefined
            objValue = undefined
            x = undefined

            f = (value) ->
              moment value, opts.locale.format

            objValue =
              startDate: null
              endDate: null
            if angular.isString(val) and val.length > 0
              if opts.singleDatePicker
                objValue = f(val)
              else
                x = val.split(opts.locale.separator).map(f)
                objValue.startDate = x[0]
                objValue.endDate = x[1]
            objValue

          modelCtrl.$isEmpty = (val) ->
            !(angular.isString(val) and val.length > 0)

          _init = ->
            eventType = undefined
            results = undefined
            el.daterangepicker angular.extend(opts, autoUpdateInput: false), (start, end) ->
              $scope.$apply ->
                $scope.model = if opts.singleDatePicker then start else
                  startDate: start
                  endDate: end
            _picker = el.data('daterangepicker')
            results = []
            for eventType of opts.eventHandlers
              results.push el.on(eventType, (e) ->
                eventName = undefined
                eventName = e.type + '.' + e.namespace
                $scope.$evalAsync opts.eventHandlers[eventName]
              )
            results

          _init()
          $scope.$watch 'model.startDate', (n) ->
            _setStartDate n
          $scope.$watch 'model.endDate', (n) ->
            _setEndDate n

          _initBoundaryField = (field, validator, modelField, optName) ->
            if attrs[field]

              modelCtrl.$validators[field] = (value) ->
                value and validator(opts[optName], value[modelField])

              return $scope.$watch(field, (date) ->
                opts[optName] = if date then moment(date) else false
                _init()
              )
            return

          _initBoundaryField 'min', _validateMin, 'startDate', 'minDate'
          _initBoundaryField 'max', _validateMax, 'endDate', 'maxDate'
          if attrs.options
            $scope.$watch 'opts', ((newOpts) ->
              opts = _mergeOpts(opts, newOpts)
              _init()
            ), true
          if attrs.clearable
            $scope.$watch 'clearable', (newClearable) ->
              if newClearable
                opts = _mergeOpts(opts, locale:
                  cancelLabel: opts.clearLabel)
              _init()
              if newClearable
                return el.on('cancel.daterangepicker', ->
                  $scope.$apply ->
                    $scope.model = if opts.singleDatePicker then null else
                      startDate: null
                      endDate: null
                )
              return
          $scope.$on '$destroy', ->
            if _picker != null then _picker.remove() else undefined

      }
  ]
  return
).call this

# ---
# generated by js2coffee 2.2.0