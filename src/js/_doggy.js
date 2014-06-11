// 初始化全局表量，各个函数都放在这个对象中，不污染全局环境
var doggy = {};

/**
 * @method throttle 用以提供resize、scroll等高频率事件的触发控制
 * @param {Function} fn 执行的函数
 * @param {Number} delay 延迟
 */
doggy.throttle = function (fn, delay) {
    var timer = true;
    return function () {
        var context = this, args = arguments;
        if (timer) {
            fn.apply(context, args);
            timer = false;
            setTimeout(function () { timer = true; }, delay);
        }
    };
};

/**
 * @method initTab 用以初始化页面中的tab
 * @param {Selector|Node} selContainer
 * @param {Object} config
 * @param {Selector} config.selToggle
 * @param {Selector} config.selSheet
 * @param {String} config.trigger 触发方式
 * @param {String} config.currentClass 选中时给toggle添加的类
 * @param {String} config.effect 切换content时使用的效果 show | fade | slide
 */
doggy.initTab = function (selContainer, config) {
    var _config = {
        selToggle: '.tab__nav a',
        selSheet: '.tab__sheet',
        currentClass: 'current',
        effect: 'show',
        trigger: 'click'
    };
    $.extend(_config, config);

    var ndContainer = $(selContainer);
    if (!ndContainer) return;

    var nlToggles = ndContainer.find(_config.selToggle),
        nlContents = ndContainer.find(_config.selSheet);

    nlToggles.bind(_config.trigger, function () {
        var _this = $(this);
        nlToggles.removeClass(_config.currentClass);
        _this.addClass(_config.currentClass);
        switch (_config.effect) {
        case 'show':
            nlContents.hide();
            nlContents.eq(nlToggles.index(_this)).show();
            break;
        case 'fade':
            nlContents.hide();
            nlContents.eq(nlToggles.index(_this)).fadeIn();
            break;
        case 'slide':
            nlContents.hide();
            nlContents.eq(nlToggles.index(_this)).slideDown();
            break;
        default:
            nlContents.hide();
            nlContents.eq(nlToggles.index(_this)).show();
        }
    });
};

/**
 * @method initLazyload
 * @description 用以初始化页面上图片的lazyload
 */
doggy.initLazyload = function () {
    var imgs = $('.lazy');
    $(window).scroll(doggy.throttle(lazyload, 50));

    function lazyload () {
        var scrollTop = $(window).scrollTop(),
            winHeight = $(window).height();

        imgs = imgs.filter(function (index) {
            var tmp = $(this);
            if (tmp.offset().top <= scrollTop + winHeight) {
                tmp.attr('src', tmp.data('src'));
                return false;
            }
            return true;
        });
        if (imgs.length === 0) {
            $(document).off('scroll');
        }
    }
};

/**
 * @method setCookie
 * @description 设置cookie
 * @param {String} key
 * @param {String} value
 * @param {Number} expire
 */
doggy.setCookie = function (key, value, expire)	{
    var DAY = 24 * 60 * 60 * 1000,
        now = new Date(),
        exp = expire ? expire : 30;

    now.setTime(now.getTime() + exp * DAY);
    document.cookie = key + "=" + encodeURIComponent(value) + "; path=/" + "; expires=" + now.toGMTString();
};

/**
 * @method getCookie
 * @description 读取cookie
 * @param {String} key
 * @return value of the key
 */
doggy.getCookie = function (key) {
    var keys = document.cookie.split("; "),
        len = keys.length, tmp;

    while (len--) {
        tmp = keys[len].split('=');
        if (tmp[0] === key) {
            return decodeURIComponent(tmp[1]);
        }
    }
};

/**
 * @method initDropdown
 * @description 初始化dropdown
 * @param {Selector|Node} selContainer
 * @param {Object} config
 * @param {Selector} config.selToggle
 * @param {Selector} config.selContent
 * @param {String} config.trigger 触发方式
 * @param {String} config.effect 使用的效果 show | fade | slide
 */
doggy.initDropdown = function (selContainer, config) {
    var _config = {
        selToggle: '.dropdown__trigger',
        selContent: '.dropdown__content',
        trigger: 'click',
        effect: "show",
        offset: 5,
        speed: 'fast'
    };
    $.extend(_config, config);

    var ndContainer = $(selContainer);
    if (!ndContainer) return;

    var ndToggle = ndContainer.find(_config.selToggle),
        ndContent = ndContainer.find(_config.selContent);

    ndContent.width(ndContainer.width() - 2).css('top', ndContainer.height() + _config.offset);

    ndToggle.bind(_config.trigger, function () {
        switch (_config.effect) {
        case 'slide':
            ndContent.slideToggle(_config.speed);
            break;
        case 'fade':
            ndContent.fadeToggle(_config.speed);
            break;
        case 'show':
            ndContent.toggle();
            break;
        default:
            ndContent.slideToggle(_config.speed);
            break;
        }
    });
};

/**
 * @method initSelect
 * @param {Selector|Node} selContainer
 * @param {Object} config
 * @param {Selector} config.selToggle
 * @param {Selector} config.selContent
 * @param {String} config.trigger
 */
doggy.initSelect = function (selContainer, config) {
    var _config = {
        selToggle: '.select__trigger',
        selContent: '.select__content',
        trigger: 'click'
    };
    $.extend(_config, config);

    var ndContainer = $(selContainer);
    if (!ndContainer) return;

    var ndToggle = ndContainer.find(_config.selToggle),
        ndContent = ndContainer.find(_config.selContent),
        ndValue = ndToggle.children('p'),
        PLACEHOLDER = ndValue.data('placeholder');

    if (!ndValue.html()) {
        ndValue.html(PLACEHOLDER);
    }
    ndContent.width(ndContainer.width() - 2).css('top', ndContainer.height());

    ndToggle.bind(_config.trigger, function () {
        ndContent.toggle();
        ndToggle.toggleClass('active');
    });

    ndContent.delegate('a', 'click', function () {
        ndValue.html($(this).html()).data('val', $(this).data('val'));
        ndContent.hide();
        ndToggle.removeClass('active');
    });
};

/**
 * @method initSmoothscroll
 * @param {Selector|Node} selContainer
 * @param {Object} config
 * @param {Selector} config.selToggle 触发节点，每个节点上需要带一个data-scroll属性，标明滚动目标，该目标可以是一个节点或者一个Y坐标
 * @param {String} config.easing 滚动特效
 * @param {Number} config.duration 滚动时间
 */
    
doggy.initSmoothscroll = function (selContainer, config) {
    var _config = {
        selToggle: 'a',
        easing: 'swing',
        duration: 300
    };
    $.extend(_config, config);

    var ndContainer = $(selContainer);
    if (!ndContainer) return;

    ndContainer.delegate(_config.selToggle, 'click', function () {
        var target = $(this).data('scroll');
        if (!target) target = 0;
        target = $.isNumeric(target) ? target : $(target).offset().top;
        $('body').animate({
            scrollTop: target
        },{
            duration: _config.duration,
            easing: _config.easing
        });
    });
};

/**
 * @method initAutoHide
 * @param {Selector} selContainer
 * @param {Object} config
 * @param {Number|Selector} config.trigger 如果是数字，则N毫秒后隐藏；如果是选择器，则那个选择器元素被点击的时候隐藏
 * @param {String} config.effect 特效 show | fade | slide
 */
doggy.initAutoHide = function (selContainer, config) {
    var _config = {
        trigger: 'body',
        effect: 'show'
    };
    $.extend(_config, config);

    var ndContainer = $(selContainer);
    if (!ndContainer) return;

    ndContainer.on('autohide', function () {
        if ($.isNumeric(_config.trigger)) {
            setTimeout(+_config.trigger, function () {
                ndContainer.hide();
            });
        } else {
            var ndTrigger = $(_config.trigger);
            if (!ndTrigger) return;
            ndTrigger.on('click', function () {
                ndContainer.hide();
            });
        }
    });
};

/**
 * @method initDialog
 */
doggy.initDialog = function (config) {
    var _config = {
        title: '',
        content: '',
        modal: true,
        position: 'bl',
        autoHide: false
    };
    $.extend(_config, config);

    if (_config.title === '' && _config.content === '') return;
    // TODO
};

/**
 * @method initTooltip
 */
doggy.initTooltip = function (selContainer, config) {
    // TODO
};

/**
 * @method initPosition
 * @param {Object} config
 * @param {Selector} config.selSelf 需要定位的元素
 * @param {Selector} config.selTarget 相对于这个元素定位
 * @param {String} config.position 定位的位置 tl,tc,tr,rt,rc,rb,br,bc,bl,lb,lc,lt(t=top, c=center, b=bottom, l=left, r=right)
 * @param {Number} config.offset 中间的空隙
 */
doggy.initPosition = function (config) {
    var _config = {
        selSelf: '',
        selTarget: '',
        position: '',
        offset: 1
    };

    var ndSelf = $(_config.selSelf),
        ndTarget = $(_config.selTarget);
    if (!ndSelf || !ndTarget) return;

    var targetPosition = ndTarget.offset(),
        targetHeight = ndTarget.height(),
        targetWidth = ndTarget.width(),
        selfHeight = ndSelf.height(),
        selfWidth = ndSelf.width();

    if (ndSelf.css('position') !== 'absolute') {
        ndSelf.css('position', 'absolute');
    }
    setPosition();

    function setPosition () {
        switch (_config.position) {
        case 'tl':
            ndSelf.css({
                left: targetPosition.left,
                bottom: targetPosition.top - _config.offset
            });
            break;
        case 'tc':
            ndSelf.css({
                left: targetPosition.left + targetWidth / 2 - selfWidth / 2,
                bottom: targetPosition.top - _config.offset
            });
            break;
        case 'tr':
            ndSelf.css({
                right: targetPosition.left + targetWidth,
                bottom: targetPosition.top - _config.offset
            });
            break;
        case 'rt':
            ndSelf.css({
                right: targetPosition.left + targetWidth + _config.offset,
                top: targetPosition.top
            });
            break;
        case 'rc':
            ndSelf.css({
                right: targetPosition.left + targetWidth + _config.offset,
                top: targetPosition.top + targetHeight / 2 - selfHeight / 2
            });
            break;
        case 'rb':
            ndSelf.css({
                right: targetPosition.left + targetWidth + _config.offset,
                bottom: targetPosition.bottom
            });
            break;
        case 'br':
            ndSelf.css({
                right: targetPosition.left + targetWidth,
                top: targetPosition.bottom - _config.offset
            });
            break;
        case 'bc':
            ndSelf.css({
                left: targetPosition.left + targetWidth / 2 - selfWidth / 2,
                bottom: targetPosition.bottom - _config.offset
            });
            break;
        case 'bl':
            ndSelf.css({
                left: targetPosition.left,
                bottom: targetPosition.bottom - _config.offset
            });
            break;
        case 'lb':
            ndSelf.css({
                right: targetPosition.left - _config.offset,
                bottom: targetPosition.bottom
            });
            break;
        case 'lc':
            ndSelf.css({
                right: targetPosition.left - _config.offset,
                top: targetPosition.top + targetHeight / 2 - selfHeight / 2
            });
            break;
        case 'lt':
            ndSelf.css({
                right: targetPosition.left - _config.offset,
                top: targetPosition.top
            });
            break;
        }
    }
};

/**
 * @method initPlaceholder
 * @description 让不支持HTML5这个属性的浏览器有类似效果
 * @param {Selector} selContainer
 * @param {Object} config
 * @param {String} config.hide 隐藏时机 focus | change
 */
doggy.initPlaceholder = function (selContainer, config) {
    if ('placeholder' in document.createElement('input')) return;

    var _config = {
        hide: 'focus'
    };
    $.extend(_config, config);

    var ndContainer = $(selContainer);
    if (!ndContainer) return;

    var placeholder = ndContainer.attr('placeholder'),
        hasPlaceholder = true,
        value;

    ndContainer.css('color', '#999').val(placeholder);
    if (_config.hide === 'focus') {
        ndContainer.on('focus', function () {
            if (ndContainer.val() === placeholder) {
                ndContainer.css('color', '#000').val('');
            }
        }).on('blur', function () {
            if (ndContainer.val() === '') {
                ndContainer.css('color', '#999').val(placeholder);
            }
        });
    } else {
        ndContainer.on('keyup', function () {
            value = ndContainer.val();
            if (value === '') {
                ndContainer.css('color', '#999').val(placeholder);
                hasPlaceholder = true;
            } else {
                if (hasPlaceholder) {
                    ndContainer.css('color', '#000').val(value.slice(placeholder.length));
                    hasPlaceholder = false;
                }
            }
        });
    }
};

/**
 * @class loadQueue
 * @description 管理onload之后的JS任务队列
 */
doggy.loadQueue = function() {
    var queue = [], flag = false,
        o = {
            push: function (cb) {
                var params = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : [];
                if (flag) cb.apply(null, params); else queue.push([cb, params]);
            },
            _exec: function () {
                var item;
                while (queue.length) {
                    item = queue.shift();
                    item[0].apply(null, item[1]);
                }
            }
        };
    window.onload = function () {
        flag = true;
        o._exec();
    };
    return o;
}();

// init lozyload and uix component
doggy.loadQueue.push(function () {
    $('[data-uix]').each(function () {
        var instance = $(this),
            params = instance.data('params');
        switch (instance.data('uix')) {
        case 'tab':
            doggy.initTab(instance, params);
            break;
        case 'dropdown':
            doggy.initDropdown(instance, params);
            break;
        case 'select':
            doggy.initSelect(instance, params);
            break;
        case 'smoothscroll':
            doggy.initSmoothscroll(instance, params);
            break;
        case 'dialog':
            instance.on('click', function () {
                doggy.initDialog(params);
            });
            break;
        case 'placeholder':
            doggy.initPlaceholder(instance, params);
            break;
        }
    });
    doggy.initLazyload();
});
