/*
 * jQuery
 * @copyright : GigolNet
 * @author : Ilia GUIGOLACHVILI
 * @web : http://gigol.net
 * @plugin : cMenu
 * @version : 1.0.0
 * Last modified : 25/01/2015
 */
(function($){

    /*
     * METHODS
     */
    var _methods = {

        /*
        * Set global settings
        */
        setSettings: function(_settings){
            this.settings = _settings;
        },

        /*
        * Initialize
        */
        init: function(){
            if (this.settings.preventDoubleContext){
                $(document).on('contextmenu', ".cmenu-dropdown", function(e){
                    e.preventDefault();
                });
            }

            $(document).on('mouseenter', ".cmenu-dropdown-submenu", function(){
                var subM = $(this).find(".cmenu-dropdown-sub:first"),
                    subWidth = subM.width(),
                    subLeft = subM.offset().left,
                    collision = (subWidth+subLeft) > window.innerWidth;
                if (collision){
                    subM.addClass("cmenu-drop-left");
                }
            });
        },

        /*
        * Menu Builder
        */
        builderMenu: function(id, data, isSub){
            var subClass = (isSub) ? " cmenu-dropdown-sub" : "",
                compressed = this.settings.compress ? " cmenu-compressed" : "",
                cM = $('<ul class="cmenu cmenu-dropdown' +subClass + compressed+ '" id="cmenu-' +id+ '" data=""></ul>'),
                subM;
            var i = 0,
                linkTarget = "",
                htmlFragment = "";

            for (i; i<data.length; i++){
                //Btn close
                if (typeof data[i].close !== 'undefined'){
                    cM.append('<li id="cmenu-close-' +id+ '" class="cmenu-close" title="Close">CLOSE</li>');
                }
                if (typeof data[i].divider !== 'undefined'){
                    cM.append('<li class="cmenu-divider"></li>');
                }
                else if (typeof data[i].header !== 'undefined'){
                    cM.append('<li class="cmenu-header">' +data[i].header+ '</li>');
                }
                else if (typeof data[i].before !== 'undefined'){
                    //Empty important
                }
                else {
                    if (typeof data[i].href === 'undefined'){
                        data[i].href = '#';
                    }
                    if (typeof data[i].target !== 'undefined'){
                        linkTarget = ' target="' +data[i].target+ '"';
                    }
                    if (typeof data[i].subMenu !== 'undefined'){
                        subM = $('<li class="cmenu-dropdown-submenu"><a tabindex="-1" href="' +data[i].href+ '">' +data[i].text+ '</a></li>');
                    }
                    else if (typeof data[i].html !== 'undefined'){
                        htmlFragment = $(data[i].html).html();
                        subM = $('<li>' +htmlFragment+ '</li>');
                    }
                    else if (typeof data[i].fragment !== 'undefined'){
                        subM = $('<li>' +data[i].fragment+ '</li>');
                    }
                    else {
                        subM = $('<li><a tabindex="-1" href="' +data[i].href+ '"' +linkTarget+ '>' +data[i].text+ '</a></li>');
                    }

                    //For events
                    var now = new Date(),
                        eventID = "event-" +now.getTime()*Math.floor(Math.random()*100000);
                    subM.find("a").attr("id", eventID);
                    $("#" +eventID).addClass("cmenu-event");

                    //Event OnClick
                    if(typeof data[i].click !== 'undefined')
                        $(document).on('click', "#" +eventID, data[i].click);

                    //Event OnMouseHover
                    if (typeof data[i].hover !== 'undefined'){
                        $(document).on('mouseenter', "#" +eventID, data[i].hover);
                        $(document).on('mouseleave', "#" +eventID, data[i].hover);
                    }

                    cM.append(subM);
                    if (typeof data[i].subMenu != 'undefined'){
                        var subMenuData = _methods.builderMenu(id, data[i].subMenu, true);
                        cM.find("li:last").append(subMenuData);
                    }
                }
            }
            return cM;
        },

        /*
        * Destory
        */
        destroyContext: function(selector){
            $(document).off('contextmenu', selector).off('click', ".cmenu-event");
        },

        /*
        * Close
        */
        close: function (){
            var cM = $(".cmenu-dropdown");
            cM.fadeOut(this.settings.fadeSpeed, function(){
                cM.css({display:""}).find(".cmenu-drop-left").removeClass("cmenu-drop-left");
                if (typeof cM.attr("data") !== 'undefined'){
                    cM.removeClass("cmenu-attach-data-" +cM.attr("data"));
                    cM.attr("data", "");
                }
            });
        }
    };

    /*
     * HANDLERS
     */
    var _handlers = {
        setSettings: function(_settings){
            this.settings = _settings;
        },

        before: function(selector, menu){
            if(this.settings.before)
                this.settings.before.call(this, selector, menu);
        }
    };

    /*
     * PLUGIN
     */
    $.fn.cMenu = function(options){
        var selector = this;

        //These are the defaults
        var d = new Date();
        var _settings = $.extend({
            id                   : d.getTime(),
            data                 : null,
            draggable            : true,
            fadeSpeed            : 100,
            above                : 'auto',
            preventDoubleContext : true,
            compress             : false,
            close                : 'html',
            before               : false
        }, options);
        var _id = _settings.id,
            _data = _settings.data,
            _fadeSpeed = _settings.fadeSpeed,
            _above = _settings.above,
            _draggable = _settings.draggable;

        //Set this settings for handlers and methods
        _handlers.setSettings(_settings);
        _methods.setSettings(_settings);

        //Init
        _methods.init();

        //Build
        var buildMenu = _methods.builderMenu(_id, _data);
        $("body").append(buildMenu);

        $(selector).on('contextmenu', function(e){
            e.preventDefault();
            e.stopPropagation();

            var cM = $("#cmenu-" +_id);

            //Call handler "before" if exist into settings
            _handlers.before($(this), cM);

            $(".cmenu-dropdown:not(.cmenu-dropdown-sub)").hide();

            //Add this data to menu data and class
            if (typeof $(this).attr("data") !== 'undefined'){
                cM.attr("data", $(this).attr("data"));
                cM.addClass("cmenu-attach-data-" +$(this).attr("data"));
            }

            if (typeof _above == 'boolean' && _above){
                cM.addClass("cmenu-dropdown-up").css({
                    top: e.pageY - 20 - $("#cmenu-"+_id).height(),
                    left: e.pageX - 13
                }).fadeIn(_fadeSpeed);
            }
            else if (typeof _above == 'string' && _above == 'auto'){
                cM.removeClass("cmenu-dropdown-up");
                var autoH = cM.height() + 12;
                if ((e.pageY + autoH) > $("html").height()){
                    cM.addClass("cmenu-dropdown-up").css({
                        top: e.pageY - 20 - autoH,
                        left: e.pageX - 13
                    }).fadeIn(_fadeSpeed);
                }
                else {
                    cM.css({
                        top: e.pageY + 10,
                        left: e.pageX - 13
                    }).fadeIn(_fadeSpeed);
                }
            }
        });

        //Dragable
        if (_draggable){
            buildMenu.draggable();
        }

        //Close
        $(buildMenu).on('contextmenu', function(){
            _methods.close();
        });
        $(buildMenu).on('click', "#cmenu-close-" +_id, function(){
            _methods.close();
        });

    };

}(jQuery));