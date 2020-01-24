/*!
 * Nestable jQuery Plugin - Copyright (c) 2012 David Bushell - http://dbushell.com/
 * Dual-licensed under the BSD or MIT licenses
 */
;(function($, window, document, undefined)
{
    var hasTouch = 'ontouchstart' in document;

    /**
     * Detect CSS pointer-events property
     * events are normally disabled on the dragging element to avoid conflicts
     * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
     */
    var hasPointerEvents = (function()
    {
        var el    = document.createElement('div'),
            docEl = document.documentElement;
        if (!('pointerEvents' in el.style)) {
            return false;
        }
        el.style.pointerEvents = 'auto';
        el.style.pointerEvents = 'x';
        docEl.appendChild(el);
        var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
        docEl.removeChild(el);
        return !!supports;
    })();

    var defaults = {
        listNodeName    : 'ol',
        itemNodeName    : 'li',
        rootClass       : 'dd',
        listClass       : 'dd-list',
        itemClass       : 'dd-item',
        dragClass       : 'dd-dragel',
        handleClass     : 'dd-handle',
        collapsedClass  : 'dd-collapsed',
        placeClass      : 'dd-placeholder',
        noDragClass     : 'dd-nodrag',
        emptyClass      : 'dd-empty',
        expandBtnHTML   : '<button data-action="expand" type="button">Expand</button>',
        collapseBtnHTML : '<button data-action="collapse" type="button">Collapse</button>',
        group           : 0,
        maxDepth        : 5,
        threshold       : 20
    };

    function Plugin(element, options)
    {
        this.w  = $(document);
        this.el = $(element);
        this.options = $.extend({}, defaults, options);
        this.init();
    }

    Plugin.prototype = {

        init: function()
        {
            var list = this;

            list.reset();

            list.el.data('nestable-group', this.options.group);

            list.placeEl = $('<div class="' + list.options.placeClass + '"/>');

            $.each(this.el.find(list.options.itemNodeName), function(k, el) {
                list.setParent($(el));
            });

            list.el.on('click', 'button', function(e) {
                if (list.dragEl) {
                    return;
                }
                var target = $(e.currentTarget),
                    action = target.data('action'),
                    item   = target.parent(list.options.itemNodeName);
                if (action === 'collapse') {
                    list.collapseItem(item);
                }
                if (action === 'expand') {
                    list.expandItem(item);
                }
            });

            var onStartEvent = function(e)
            {
                var handle = $(e.target);
                if (!handle.hasClass(list.options.handleClass)) {
                    if (handle.closest('.' + list.options.noDragClass).length) {
                        return;
                    }
                    handle = handle.closest('.' + list.options.handleClass);
                }

                if (!handle.length || list.dragEl) {
                    return;
                }

                list.isTouch = /^touch/.test(e.type);
                if (list.isTouch && e.touches.length !== 1) {
                    return;
                }

                e.preventDefault();
                list.dragStart(e.touches ? e.touches[0] : e);
            };

            var onMoveEvent = function(e)
            {
                if (list.dragEl) {
                    e.preventDefault();
                    list.dragMove(e.touches ? e.touches[0] : e);
                }
            };

            var onEndEvent = function(e)
            {
                if (list.dragEl) {
                    e.preventDefault();
                    list.dragStop(e.touches ? e.touches[0] : e);
                }
            };

            if (hasTouch) {
                list.el[0].addEventListener('touchstart', onStartEvent, false);
                window.addEventListener('touchmove', onMoveEvent, false);
                window.addEventListener('touchend', onEndEvent, false);
                window.addEventListener('touchcancel', onEndEvent, false);
            }

            list.el.on('mousedown', onStartEvent);
            list.w.on('mousemove', onMoveEvent);
            list.w.on('mouseup', onEndEvent);

        },

        serialize: function()
        {
            var data,
                depth = 0,
                list  = this;
            step  = function(level, depth)
            {
                var array = [ ],
                    items = level.children(list.options.itemNodeName);
                items.each(function()
                {
                    var li   = $(this),
                        item = $.extend({}, li.data()),
                        sub  = li.children(list.options.listNodeName);
                    if (sub.length) {
                        item.children = step(sub, depth + 1);
                    }
                    array.push(item);
                });
                return array;
            };
            data = step(list.el.find(list.options.listNodeName).first(), depth);
            return data;
        },

        serialise: function()
        {
            return this.serialize();
        },

        reset: function()
        {
            this.mouse = {
                offsetX   : 0,
                offsetY   : 0,
                startX    : 0,
                startY    : 0,
                lastX     : 0,
                lastY     : 0,
                nowX      : 0,
                nowY      : 0,
                distX     : 0,
                distY     : 0,
                dirAx     : 0,
                dirX      : 0,
                dirY      : 0,
                lastDirX  : 0,
                lastDirY  : 0,
                distAxX   : 0,
                distAxY   : 0
            };
            this.isTouch    = false;
            this.moving     = false;
            this.dragEl     = null;
            this.dragRootEl = null;
            this.dragDepth  = 0;
            this.hasNewRoot = false;
            this.pointEl    = null;
        },

        expandItem: function(li)
        {
            li.removeClass(this.options.collapsedClass);
            li.children('[data-action="expand"]').hide();
            li.children('[data-action="collapse"]').show();
            li.children(this.options.listNodeName).show();
        },

        collapseItem: function(li)
        {
            var lists = li.children(this.options.listNodeName);
            if (lists.length) {
                li.addClass(this.options.collapsedClass);
                li.children('[data-action="collapse"]').hide();
                li.children('[data-action="expand"]').show();
                li.children(this.options.listNodeName).hide();
            }
        },

        expandAll: function()
        {
            var list = this;
            list.el.find(list.options.itemNodeName).each(function() {
                list.expandItem($(this));
            });
        },

        collapseAll: function()
        {
            var list = this;
            list.el.find(list.options.itemNodeName).each(function() {
                list.collapseItem($(this));
            });
        },

        setParent: function(li)
        {
            if (li.children(this.options.listNodeName).length) {
                li.prepend($(this.options.expandBtnHTML));
                li.prepend($(this.options.collapseBtnHTML));
            }
            li.children('[data-action="expand"]').hide();
        },

        unsetParent: function(li)
        {
            li.removeClass(this.options.collapsedClass);
            li.children('[data-action]').remove();
            li.children(this.options.listNodeName).remove();
        },

        dragStart: function(e)
        {
            var mouse    = this.mouse,
                target   = $(e.target),
                dragItem = target.closest(this.options.itemNodeName);

            this.placeEl.css('height', dragItem.height());

            mouse.offsetX = e.offsetX !== undefined ? e.offsetX : e.pageX - target.offset().left;
            mouse.offsetY = e.offsetY !== undefined ? e.offsetY : e.pageY - target.offset().top;
            mouse.startX = mouse.lastX = e.pageX;
            mouse.startY = mouse.lastY = e.pageY;

            this.dragRootEl = this.el;

            this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.listClass + ' ' + this.options.dragClass);
            this.dragEl.css('width', dragItem.width());

            dragItem.after(this.placeEl);
            dragItem[0].parentNode.removeChild(dragItem[0]);
            dragItem.appendTo(this.dragEl);

            $(document.body).append(this.dragEl);
            this.dragEl.css({
                'left' : e.pageX - mouse.offsetX,
                'top'  : e.pageY - mouse.offsetY
            });
            // total depth of dragging item
            var i, depth,
                items = this.dragEl.find(this.options.itemNodeName);
            for (i = 0; i < items.length; i++) {
                depth = $(items[i]).parents(this.options.listNodeName).length;
                if (depth > this.dragDepth) {
                    this.dragDepth = depth;
                }
            }
        },

        dragStop: function(e)
        {
            var el = this.dragEl.children(this.options.itemNodeName).first();
            el[0].parentNode.removeChild(el[0]);
            this.placeEl.replaceWith(el);

            this.dragEl.remove();
            this.el.trigger('change');
            if (this.hasNewRoot) {
                this.dragRootEl.trigger('change');
            }
            this.reset();
        },

        dragMove: function(e)
        {
            var list, parent, prev, next, depth,
                opt   = this.options,
                mouse = this.mouse;

            this.dragEl.css({
                'left' : e.pageX - mouse.offsetX,
                'top'  : e.pageY - mouse.offsetY
            });

            // mouse position last events
            mouse.lastX = mouse.nowX;
            mouse.lastY = mouse.nowY;
            // mouse position this events
            mouse.nowX  = e.pageX;
            mouse.nowY  = e.pageY;
            // distance mouse moved between events
            mouse.distX = mouse.nowX - mouse.lastX;
            mouse.distY = mouse.nowY - mouse.lastY;
            // direction mouse was moving
            mouse.lastDirX = mouse.dirX;
            mouse.lastDirY = mouse.dirY;
            // direction mouse is now moving (on both axis)
            mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
            mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;
            // axis mouse is now moving on
            var newAx   = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;

            // do nothing on first move
            if (!mouse.moving) {
                mouse.dirAx  = newAx;
                mouse.moving = true;
                return;
            }

            // calc distance moved on this axis (and direction)
            if (mouse.dirAx !== newAx) {
                mouse.distAxX = 0;
                mouse.distAxY = 0;
            } else {
                mouse.distAxX += Math.abs(mouse.distX);
                if (mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
                    mouse.distAxX = 0;
                }
                mouse.distAxY += Math.abs(mouse.distY);
                if (mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
                    mouse.distAxY = 0;
                }
            }
            mouse.dirAx = newAx;

            /**
             * move horizontal
             */
            if (mouse.dirAx && mouse.distAxX >= opt.threshold) {
                // reset move distance on x-axis for new phase
                mouse.distAxX = 0;
                prev = this.placeEl.prev(opt.itemNodeName);
                // increase horizontal level if previous sibling exists and is not collapsed
                if (mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass)) {
                    // cannot increase level when item above is collapsed
                    list = prev.find(opt.listNodeName).last();
                    // check if depth limit has reached
                    depth = this.placeEl.parents(opt.listNodeName).length;
                    if (depth + this.dragDepth <= opt.maxDepth) {
                        // create new sub-level if one doesn't exist
                        if (!list.length) {
                            list = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
                            list.append(this.placeEl);
                            prev.append(list);
                            this.setParent(prev);
                        } else {
                            // else append to next level up
                            list = prev.children(opt.listNodeName).last();
                            list.append(this.placeEl);
                        }
                    }
                }
                // decrease horizontal level
                if (mouse.distX < 0) {
                    // we can't decrease a level if an item preceeds the current one
                    next = this.placeEl.next(opt.itemNodeName);
                    if (!next.length) {
                        parent = this.placeEl.parent();
                        this.placeEl.closest(opt.itemNodeName).after(this.placeEl);
                        if (!parent.children().length) {
                            this.unsetParent(parent.parent());
                        }
                    }
                }
            }

            var isEmpty = false;

            // find list item under cursor
            if (!hasPointerEvents) {
                this.dragEl[0].style.visibility = 'hidden';
            }
            this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));
            if (!hasPointerEvents) {
                this.dragEl[0].style.visibility = 'visible';
            }
            if (this.pointEl.hasClass(opt.handleClass)) {
                this.pointEl = this.pointEl.parent(opt.itemNodeName);
            }
            if (this.pointEl.hasClass(opt.emptyClass)) {
                isEmpty = true;
            }
            else if (!this.pointEl.length || !this.pointEl.hasClass(opt.itemClass)) {
                return;
            }

            // find parent list of item under cursor
            var pointElRoot = this.pointEl.closest('.' + opt.rootClass),
                isNewRoot   = this.dragRootEl.data('nestable-id') !== pointElRoot.data('nestable-id');

            /**
             * move vertical
             */
            if (!mouse.dirAx || isNewRoot || isEmpty) {
                // check if groups match if dragging over new root
                if (isNewRoot && opt.group !== pointElRoot.data('nestable-group')) {
                    return;
                }
                // check depth limit
                depth = this.dragDepth - 1 + this.pointEl.parents(opt.listNodeName).length;
                if (depth > opt.maxDepth) {
                    return;
                }
                var before = e.pageY < (this.pointEl.offset().top + this.pointEl.height() / 2);
                parent = this.placeEl.parent();
                // if empty create new list to replace empty placeholder
                if (isEmpty) {
                    list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass);
                    list.append(this.placeEl);
                    this.pointEl.replaceWith(list);
                }
                else if (before) {
                    this.pointEl.before(this.placeEl);
                }
                else {
                    this.pointEl.after(this.placeEl);
                }
                if (!parent.children().length) {
                    this.unsetParent(parent.parent());
                }
                if (!this.dragRootEl.find(opt.itemNodeName).length) {
                    this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');
                }
                // parent root list has changed
                if (isNewRoot) {
                    this.dragRootEl = pointElRoot;
                    this.hasNewRoot = this.el[0] !== this.dragRootEl[0];
                }
            }
        }

    };

    $.fn.nestable = function(params)
    {
        var lists  = this,
            retval = this;

        lists.each(function()
        {
            var plugin = $(this).data("nestable");

            if (!plugin) {
                $(this).data("nestable", new Plugin(this, params));
                $(this).data("nestable-id", new Date().getTime());
            } else {
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });

        return retval || lists;
    };

})(window.jQuery || window.Zepto, window, document);

/* ===================================================
 *  jquery-sortable.js v0.9.13
 *  http://johnny.github.com/jquery-sortable/
 * ===================================================
 *  Copyright (c) 2012 Jonas von Andrian
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 *  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ========================================================== */


!function ( $, window, pluginName, undefined){
    var containerDefaults = {
            // If true, items can be dragged from this container
            drag: true,
            // If true, items can be droped onto this container
            drop: true,
            // Exclude items from being draggable, if the
            // selector matches the item
            exclude: "",
            // If true, search for nested containers within an item.If you nest containers,
            // either the original selector with which you call the plugin must only match the top containers,
            // or you need to specify a group (see the bootstrap nav example)
            nested: true,
            // If true, the items are assumed to be arranged vertically
            vertical: true
        }, // end container defaults
        groupDefaults = {
            // This is executed after the placeholder has been moved.
            // $closestItemOrContainer contains the closest item, the placeholder
            // has been put at or the closest empty Container, the placeholder has
            // been appended to.
            afterMove: function ($placeholder, container, $closestItemOrContainer) {
            },
            // The exact css path between the container and its items, e.g. "> tbody"
            containerPath: "",
            // The css selector of the containers
            containerSelector: "ol, ul",
            // Distance the mouse has to travel to start dragging
            distance: 0,
            // Time in milliseconds after mousedown until dragging should start.
            // This option can be used to prevent unwanted drags when clicking on an element.
            delay: 0,
            // The css selector of the drag handle
            handle: "",
            // The exact css path between the item and its subcontainers.
            // It should only match the immediate items of a container.
            // No item of a subcontainer should be matched. E.g. for ol>div>li the itemPath is "> div"
            itemPath: "",
            // The css selector of the items
            itemSelector: "li",
            // The class given to "body" while an item is being dragged
            bodyClass: "dragging",
            // The class giving to an item while being dragged
            draggedClass: "dragged",
            // Check if the dragged item may be inside the container.
            // Use with care, since the search for a valid container entails a depth first search
            // and may be quite expensive.
            isValidTarget: function ($item, container) {
                return true
            },
            // Executed before onDrop if placeholder is detached.
            // This happens if pullPlaceholder is set to false and the drop occurs outside a container.
            onCancel: function ($item, container, _super, event) {
            },
            // Executed at the beginning of a mouse move event.
            // The Placeholder has not been moved yet.
            onDrag: function ($item, position, _super, event) {
                $item.css(position)
            },
            // Called after the drag has been started,
            // that is the mouse button is being held down and
            // the mouse is moving.
            // The container is the closest initialized container.
            // Therefore it might not be the container, that actually contains the item.
            onDragStart: function ($item, container, _super, event) {
                $item.css({
                    height: $item.outerHeight(),
                    width: $item.outerWidth()
                })
                $item.addClass(container.group.options.draggedClass)
                $("body").addClass(container.group.options.bodyClass)
            },
            // Called when the mouse button is being released
            onDrop: function ($item, container, _super, event) {
                $item.removeClass(container.group.options.draggedClass).removeAttr("style")
                $("body").removeClass(container.group.options.bodyClass)
            },
            // Called on mousedown. If falsy value is returned, the dragging will not start.
            // Ignore if element clicked is input, select or textarea
            onMousedown: function ($item, _super, event) {
                if (!event.target.nodeName.match(/^(input|select|textarea)$/i)) {
                    event.preventDefault()
                    return true
                }
            },
            // The class of the placeholder (must match placeholder option markup)
            placeholderClass: "placeholder",
            // Template for the placeholder. Can be any valid jQuery input
            // e.g. a string, a DOM element.
            // The placeholder must have the class "placeholder"
            placeholder: '<li class="placeholder"></li>',
            // If true, the position of the placeholder is calculated on every mousemove.
            // If false, it is only calculated when the mouse is above a container.
            pullPlaceholder: true,
            // Specifies serialization of the container group.
            // The pair $parent/$children is either container/items or item/subcontainers.
            serialize: function ($parent, $children, parentIsContainer) {
                var result = $.extend({}, $parent.data())

                if(parentIsContainer)
                    return [$children]
                else if ($children[0]){
                    result.children = $children
                }

                delete result.subContainers
                delete result.sortable

                return result
            },
            // Set tolerance while dragging. Positive values decrease sensitivity,
            // negative values increase it.
            tolerance: 0
        }, // end group defaults
        containerGroups = {},
        groupCounter = 0,
        emptyBox = {
            left: 0,
            top: 0,
            bottom: 0,
            right:0
        },
        eventNames = {
            start: "touchstart.sortable mousedown.sortable",
            drop: "touchend.sortable touchcancel.sortable mouseup.sortable",
            drag: "touchmove.sortable mousemove.sortable",
            scroll: "scroll.sortable"
        },
        subContainerKey = "subContainers"

    /*
     * a is Array [left, right, top, bottom]
     * b is array [left, top]
     */
    function d(a,b) {
        var x = Math.max(0, a[0] - b[0], b[0] - a[1]),
            y = Math.max(0, a[2] - b[1], b[1] - a[3])
        return x+y;
    }

    function setDimensions(array, dimensions, tolerance, useOffset) {
        var i = array.length,
            offsetMethod = useOffset ? "offset" : "position"
        tolerance = tolerance || 0

        while(i--){
            var el = array[i].el ? array[i].el : $(array[i]),
                // use fitting method
                pos = el[offsetMethod]()
            pos.left += parseInt(el.css('margin-left'), 10)
            pos.top += parseInt(el.css('margin-top'),10)
            dimensions[i] = [
                pos.left - tolerance,
                pos.left + el.outerWidth() + tolerance,
                pos.top - tolerance,
                pos.top + el.outerHeight() + tolerance
            ]
        }
    }

    function getRelativePosition(pointer, element) {
        var offset = element.offset()
        return {
            left: pointer.left - offset.left,
            top: pointer.top - offset.top
        }
    }

    function sortByDistanceDesc(dimensions, pointer, lastPointer) {
        pointer = [pointer.left, pointer.top]
        lastPointer = lastPointer && [lastPointer.left, lastPointer.top]

        var dim,
            i = dimensions.length,
            distances = []

        while(i--){
            dim = dimensions[i]
            distances[i] = [i,d(dim,pointer), lastPointer && d(dim, lastPointer)]
        }
        distances = distances.sort(function  (a,b) {
            return b[1] - a[1] || b[2] - a[2] || b[0] - a[0]
        })

        // last entry is the closest
        return distances
    }

    function ContainerGroup(options) {
        this.options = $.extend({}, groupDefaults, options)
        this.containers = []

        if(!this.options.rootGroup){
            this.scrollProxy = $.proxy(this.scroll, this)
            this.dragProxy = $.proxy(this.drag, this)
            this.dropProxy = $.proxy(this.drop, this)
            this.placeholder = $(this.options.placeholder)

            if(!options.isValidTarget)
                this.options.isValidTarget = undefined
        }
    }

    ContainerGroup.get = function  (options) {
        if(!containerGroups[options.group]) {
            if(options.group === undefined)
                options.group = groupCounter ++

            containerGroups[options.group] = new ContainerGroup(options)
        }

        return containerGroups[options.group]
    }

    ContainerGroup.prototype = {
        dragInit: function  (e, itemContainer) {
            this.$document = $(itemContainer.el[0].ownerDocument)

            // get item to drag
            var closestItem = $(e.target).closest(this.options.itemSelector);
            // using the length of this item, prevents the plugin from being started if there is no handle being clicked on.
            // this may also be helpful in instantiating multidrag.
            if (closestItem.length) {
                this.item = closestItem;
                this.itemContainer = itemContainer;
                if (this.item.is(this.options.exclude) || !this.options.onMousedown(this.item, groupDefaults.onMousedown, e)) {
                    return;
                }
                this.setPointer(e);
                this.toggleListeners('on');
                this.setupDelayTimer();
                this.dragInitDone = true;
            }
        },
        drag: function  (e) {
            if(!this.dragging){
                if(!this.distanceMet(e) || !this.delayMet)
                    return

                this.options.onDragStart(this.item, this.itemContainer, groupDefaults.onDragStart, e)
                this.item.before(this.placeholder)
                this.dragging = true
            }

            this.setPointer(e)
            // place item under the cursor
            this.options.onDrag(this.item,
                getRelativePosition(this.pointer, this.item.offsetParent()),
                groupDefaults.onDrag,
                e)

            var p = this.getPointer(e),
                box = this.sameResultBox,
                t = this.options.tolerance

            if(!box || box.top - t > p.top || box.bottom + t < p.top || box.left - t > p.left || box.right + t < p.left)
                if(!this.searchValidTarget()){
                    this.placeholder.detach()
                    this.lastAppendedItem = undefined
                }
        },
        drop: function  (e) {
            this.toggleListeners('off')

            this.dragInitDone = false

            if(this.dragging){
                // processing Drop, check if placeholder is detached
                if(this.placeholder.closest("html")[0]){
                    this.placeholder.before(this.item).detach()
                } else {
                    this.options.onCancel(this.item, this.itemContainer, groupDefaults.onCancel, e)
                }
                this.options.onDrop(this.item, this.getContainer(this.item), groupDefaults.onDrop, e)

                // cleanup
                this.clearDimensions()
                this.clearOffsetParent()
                this.lastAppendedItem = this.sameResultBox = undefined
                this.dragging = false
            }
        },
        searchValidTarget: function  (pointer, lastPointer) {
            if(!pointer){
                pointer = this.relativePointer || this.pointer
                lastPointer = this.lastRelativePointer || this.lastPointer
            }

            var distances = sortByDistanceDesc(this.getContainerDimensions(),
                pointer,
                lastPointer),
                i = distances.length

            while(i--){
                var index = distances[i][0],
                    distance = distances[i][1]

                if(!distance || this.options.pullPlaceholder){
                    var container = this.containers[index]
                    if(!container.disabled){
                        if(!this.$getOffsetParent()){
                            var offsetParent = container.getItemOffsetParent()
                            pointer = getRelativePosition(pointer, offsetParent)
                            lastPointer = getRelativePosition(lastPointer, offsetParent)
                        }
                        if(container.searchValidTarget(pointer, lastPointer))
                            return true
                    }
                }
            }
            if(this.sameResultBox)
                this.sameResultBox = undefined
        },
        movePlaceholder: function  (container, item, method, sameResultBox) {
            var lastAppendedItem = this.lastAppendedItem
            if(!sameResultBox && lastAppendedItem && lastAppendedItem[0] === item[0])
                return;

            item[method](this.placeholder)
            this.lastAppendedItem = item
            this.sameResultBox = sameResultBox
            this.options.afterMove(this.placeholder, container, item)
        },
        getContainerDimensions: function  () {
            if(!this.containerDimensions)
                setDimensions(this.containers, this.containerDimensions = [], this.options.tolerance, !this.$getOffsetParent())
            return this.containerDimensions
        },
        getContainer: function  (element) {
            return element.closest(this.options.containerSelector).data(pluginName)
        },
        $getOffsetParent: function  () {
            if(this.offsetParent === undefined){
                var i = this.containers.length - 1,
                    offsetParent = this.containers[i].getItemOffsetParent()

                if(!this.options.rootGroup){
                    while(i--){
                        if(offsetParent[0] != this.containers[i].getItemOffsetParent()[0]){
                            // If every container has the same offset parent,
                            // use position() which is relative to this parent,
                            // otherwise use offset()
                            // compare #setDimensions
                            offsetParent = false
                            break;
                        }
                    }
                }

                this.offsetParent = offsetParent
            }
            return this.offsetParent
        },
        setPointer: function (e) {
            var pointer = this.getPointer(e)

            if(this.$getOffsetParent()){
                var relativePointer = getRelativePosition(pointer, this.$getOffsetParent())
                this.lastRelativePointer = this.relativePointer
                this.relativePointer = relativePointer
            }

            this.lastPointer = this.pointer
            this.pointer = pointer
        },
        distanceMet: function (e) {
            var currentPointer = this.getPointer(e)
            return (Math.max(
                Math.abs(this.pointer.left - currentPointer.left),
                Math.abs(this.pointer.top - currentPointer.top)
            ) >= this.options.distance)
        },
        getPointer: function(e) {
            var o = e.originalEvent || e.originalEvent.touches && e.originalEvent.touches[0]
            return {
                left: e.pageX || o.pageX,
                top: e.pageY || o.pageY
            }
        },
        setupDelayTimer: function () {
            var that = this
            this.delayMet = !this.options.delay

            // init delay timer if needed
            if (!this.delayMet) {
                clearTimeout(this._mouseDelayTimer);
                this._mouseDelayTimer = setTimeout(function() {
                    that.delayMet = true
                }, this.options.delay)
            }
        },
        scroll: function  (e) {
            this.clearDimensions()
            this.clearOffsetParent() // TODO is this needed?
        },
        toggleListeners: function (method) {
            var that = this,
                events = ['drag','drop','scroll']

            $.each(events,function  (i,event) {
                that.$document[method](eventNames[event], that[event + 'Proxy'])
            })
        },
        clearOffsetParent: function () {
            this.offsetParent = undefined
        },
        // Recursively clear container and item dimensions
        clearDimensions: function  () {
            this.traverse(function(object){
                object._clearDimensions()
            })
        },
        traverse: function(callback) {
            callback(this)
            var i = this.containers.length
            while(i--){
                this.containers[i].traverse(callback)
            }
        },
        _clearDimensions: function(){
            this.containerDimensions = undefined
        },
        _destroy: function () {
            containerGroups[this.options.group] = undefined
        }
    }

    function Container(element, options) {
        this.el = element
        this.options = $.extend( {}, containerDefaults, options)

        this.group = ContainerGroup.get(this.options)
        this.rootGroup = this.options.rootGroup || this.group
        this.handle = this.rootGroup.options.handle || this.rootGroup.options.itemSelector

        var itemPath = this.rootGroup.options.itemPath
        this.target = itemPath ? this.el.find(itemPath) : this.el

        this.target.on(eventNames.start, this.handle, $.proxy(this.dragInit, this))

        if(this.options.drop)
            this.group.containers.push(this)
    }

    Container.prototype = {
        dragInit: function  (e) {
            var rootGroup = this.rootGroup

            if( !this.disabled &&
                !rootGroup.dragInitDone &&
                this.options.drag &&
                this.isValidDrag(e)) {
                rootGroup.dragInit(e, this)
            }
        },
        isValidDrag: function(e) {
            return e.which == 1 ||
                e.type == "touchstart" && e.originalEvent.touches.length == 1
        },
        searchValidTarget: function  (pointer, lastPointer) {
            var distances = sortByDistanceDesc(this.getItemDimensions(),
                pointer,
                lastPointer),
                i = distances.length,
                rootGroup = this.rootGroup,
                validTarget = !rootGroup.options.isValidTarget ||
                    rootGroup.options.isValidTarget(rootGroup.item, this)

            if(!i && validTarget){
                rootGroup.movePlaceholder(this, this.target, "append")
                return true
            } else
                while(i--){
                    var index = distances[i][0],
                        distance = distances[i][1]
                    if(!distance && this.hasChildGroup(index)){
                        var found = this.getContainerGroup(index).searchValidTarget(pointer, lastPointer)
                        if(found)
                            return true
                    }
                    else if(validTarget){
                        this.movePlaceholder(index, pointer)
                        return true
                    }
                }
        },
        movePlaceholder: function  (index, pointer) {
            var item = $(this.items[index]),
                dim = this.itemDimensions[index],
                method = "after",
                width = item.outerWidth(),
                height = item.outerHeight(),
                offset = item.offset(),
                sameResultBox = {
                    left: offset.left,
                    right: offset.left + width,
                    top: offset.top,
                    bottom: offset.top + height
                }
            if(this.options.vertical){
                var yCenter = (dim[2] + dim[3]) / 2,
                    inUpperHalf = pointer.top <= yCenter
                if(inUpperHalf){
                    method = "before"
                    sameResultBox.bottom -= height / 2
                } else
                    sameResultBox.top += height / 2
            } else {
                var xCenter = (dim[0] + dim[1]) / 2,
                    inLeftHalf = pointer.left <= xCenter
                if(inLeftHalf){
                    method = "before"
                    sameResultBox.right -= width / 2
                } else
                    sameResultBox.left += width / 2
            }
            if(this.hasChildGroup(index))
                sameResultBox = emptyBox
            this.rootGroup.movePlaceholder(this, item, method, sameResultBox)
        },
        getItemDimensions: function  () {
            if(!this.itemDimensions){
                this.items = this.$getChildren(this.el, "item").filter(
                    ":not(." + this.group.options.placeholderClass + ", ." + this.group.options.draggedClass + ")"
                ).get()
                setDimensions(this.items, this.itemDimensions = [], this.options.tolerance)
            }
            return this.itemDimensions
        },
        getItemOffsetParent: function  () {
            var offsetParent,
                el = this.el
            // Since el might be empty we have to check el itself and
            // can not do something like el.children().first().offsetParent()
            if(el.css("position") === "relative" || el.css("position") === "absolute"  || el.css("position") === "fixed")
                offsetParent = el
            else
                offsetParent = el.offsetParent()
            return offsetParent
        },
        hasChildGroup: function (index) {
            return this.options.nested && this.getContainerGroup(index)
        },
        getContainerGroup: function  (index) {
            var childGroup = $.data(this.items[index], subContainerKey)
            if( childGroup === undefined){
                var childContainers = this.$getChildren(this.items[index], "container")
                childGroup = false

                if(childContainers[0]){
                    var options = $.extend({}, this.options, {
                        rootGroup: this.rootGroup,
                        group: groupCounter ++
                    })
                    childGroup = childContainers[pluginName](options).data(pluginName).group
                }
                $.data(this.items[index], subContainerKey, childGroup)
            }
            return childGroup
        },
        $getChildren: function (parent, type) {
            var options = this.rootGroup.options,
                path = options[type + "Path"],
                selector = options[type + "Selector"]

            parent = $(parent)
            if(path)
                parent = parent.find(path)

            return parent.children(selector)
        },
        _serialize: function (parent, isContainer) {
            var that = this,
                childType = isContainer ? "item" : "container",

                children = this.$getChildren(parent, childType).not(this.options.exclude).map(function () {
                    return that._serialize($(this), !isContainer)
                }).get()

            return this.rootGroup.options.serialize(parent, children, isContainer)
        },
        traverse: function(callback) {
            $.each(this.items || [], function(item){
                var group = $.data(this, subContainerKey)
                if(group)
                    group.traverse(callback)
            });

            callback(this)
        },
        _clearDimensions: function  () {
            this.itemDimensions = undefined
        },
        _destroy: function() {
            var that = this;

            this.target.off(eventNames.start, this.handle);
            this.el.removeData(pluginName)

            if(this.options.drop)
                this.group.containers = $.grep(this.group.containers, function(val){
                    return val != that
                })

            $.each(this.items || [], function(){
                $.removeData(this, subContainerKey)
            })
        }
    }

    var API = {
        enable: function() {
            this.traverse(function(object){
                object.disabled = false
            })
        },
        disable: function (){
            this.traverse(function(object){
                object.disabled = true
            })
        },
        serialize: function () {
            return this._serialize(this.el, true)
        },
        refresh: function() {
            this.traverse(function(object){
                object._clearDimensions()
            })
        },
        destroy: function () {
            this.traverse(function(object){
                object._destroy();
            })
        }
    }

    $.extend(Container.prototype, API)

    /**
     * jQuery API
     *
     * Parameters are
     *   either options on init
     *   or a method name followed by arguments to pass to the method
     */
    $.fn[pluginName] = function(methodOrOptions) {
        var args = Array.prototype.slice.call(arguments, 1)

        return this.map(function(){
            var $t = $(this),
                object = $t.data(pluginName)

            if(object && API[methodOrOptions])
                return API[methodOrOptions].apply(object, args) || this
            else if(!object && (methodOrOptions === undefined ||
                typeof methodOrOptions === "object"))
                $t.data(pluginName, new Container($t, methodOrOptions))

            return this
        });
    };

}(jQuery, window, 'sortable');