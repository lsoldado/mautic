//LeadBundle
Mautic.leadOnLoad = function (container, response) {
    Mautic.addKeyboardShortcut('a', 'Quick add a New Contact', function(e) {
        if(mQuery('a.quickadd').length) {
            mQuery('a.quickadd').click();
        } else if (mQuery('a.btn-leadnote-add').length) {
            mQuery('a.btn-leadnote-add').click();
        }
    }, 'contact pages');

    Mautic.addKeyboardShortcut('t', 'Activate Table View', function(e) {
        mQuery('#table-view').click();
    }, 'contact pages');

    Mautic.addKeyboardShortcut('c', 'Activate Card View', function(e) {
        mQuery('#card-view').click();
    }, 'contact pages');

    //Prevent single combo keys from initiating within lead note
    Mousetrap.stopCallback = function(e, element, combo) {
        if (element.id == 'leadnote_text' && combo != 'mod+enter') {
            return true;
        }

        // if the element has the class "mousetrap" then no need to stop
        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
            return false;
        }

        // stop for input, select, and textarea
        return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || (element.contentEditable && element.contentEditable == 'true');
    };

    // Timeline filters
    var timelineForm = mQuery(container + ' #timeline-filters');
    if (timelineForm.length) {
        timelineForm.on('change', function() {
            timelineForm.submit();
        }).on('keyup', function() {
            timelineForm.delay(200).submit();
        }).on('submit', function(e) {
            e.preventDefault();
            Mautic.refreshLeadTimeline(timelineForm);
        });

        var toggleTimelineDetails = function (el) {
            var activateDetailsState = mQuery(el).hasClass('active');

            if (activateDetailsState) {
                mQuery('#timeline-details-'+detailsId).addClass('hide');
                mQuery(el).removeClass('active');
            } else {
                mQuery('#timeline-details-'+detailsId).removeClass('hide');
                mQuery(el).addClass('active');
            }
        };

        Mautic.leadTimelineOnLoad(container, response);
    }

    //Note type filters
    var noteForm = mQuery(container + ' #note-filters');
    if (noteForm.length) {
        noteForm.on('change', function() {
            noteForm.submit();
        }).on('keyup', function() {
            noteForm.delay(200).submit();
        }).on('submit', function(e) {
            e.preventDefault();
            Mautic.refreshLeadNotes(noteForm);
        });
    }

    if (mQuery(container + ' #list-search').length) {
        Mautic.activateSearchAutocomplete('list-search', 'lead.lead');
    }

    if (mQuery(container + ' #notes-container').length) {
        Mautic.activateSearchAutocomplete('NoteFilter', 'lead.note');
    }

    if (mQuery('#lead_preferred_profile_image').length) {
        mQuery('#lead_preferred_profile_image').on('change', function() {
            if (mQuery(this).val() == 'custom') {
                mQuery('#customAvatarContainer').slideDown('fast');
            } else {
                mQuery('#customAvatarContainer').slideUp('fast');
            }
        })
    }

    if (mQuery('.lead-avatar-panel').length) {
        mQuery('.lead-avatar-panel .avatar-collapser a.arrow').on('click', function() {
            setTimeout(function() {
                var status = (mQuery('#lead-avatar-block').hasClass('in') ? 'expanded' : 'collapsed');
                Cookies.set('mautic_lead_avatar_panel', status, {expires: 30});
            }, 500);
        });
    }

    if (mQuery('#anonymousLeadButton').length) {
        var searchValue = mQuery('#list-search').typeahead('val').toLowerCase();
        var string      = mQuery('#anonymousLeadButton').data('anonymous').toLowerCase();

        if (searchValue.indexOf(string) >= 0 && searchValue.indexOf('!' + string) == -1) {
            mQuery('#anonymousLeadButton').addClass('btn-primary');
        } else {
            mQuery('#anonymousLeadButton').removeClass('btn-primary');
        }
    }

    var leadMap = [];

    mQuery(document).on('shown.bs.tab', 'a#load-lead-map', function (e) {
        leadMap = Mautic.renderMap(mQuery('#place-container .vector-map'));
    });

    mQuery('a[data-toggle="tab"]').not('a#load-lead-map').on('shown.bs.tab', function (e) {
        if (leadMap.length) {
            Mautic.destroyMap(leadMap);
            leadMap = [];
        }
    });

    Mautic.initUniqueIdentifierFields();
};

Mautic.leadTimelineOnLoad = function (container, response) {
    mQuery("#contact-timeline a[data-activate-details='all']").on('click', function() {
        if (mQuery(this).find('span').first().hasClass('fa-level-down')) {
            mQuery("#contact-timeline a[data-activate-details!='all']").each(function () {
                var detailsId = mQuery(this).data('activate-details');
                if (detailsId && mQuery('#timeline-details-'+detailsId).length) {
                    mQuery('#timeline-details-' + detailsId).removeClass('hide');
                    mQuery(this).addClass('active');
                }
            });
            mQuery(this).find('span').first().removeClass('fa-level-down').addClass('fa-level-up');
        } else {
            mQuery("#contact-timeline a[data-activate-details!='all']").each(function () {
                var detailsId = mQuery(this).data('activate-details');
                if (detailsId && mQuery('#timeline-details-'+detailsId).length) {
                    mQuery('#timeline-details-' + detailsId).addClass('hide');
                    mQuery(this).removeClass('active');
                }
            });
            mQuery(this).find('span').first().removeClass('fa-level-up').addClass('fa-level-down');
        }
    });
    mQuery("#contact-timeline a[data-activate-details!='all']").on('click', function() {
        var detailsId = mQuery(this).data('activate-details');
        if (detailsId && mQuery('#timeline-details-'+detailsId).length) {
            var activateDetailsState = mQuery(this).hasClass('active');

            if (activateDetailsState) {
                mQuery('#timeline-details-'+detailsId).addClass('hide');
                mQuery(this).removeClass('active');
            } else {
                mQuery('#timeline-details-'+detailsId).removeClass('hide');
                mQuery(this).addClass('active');
            }
        }
    });

    if (response && typeof response.timelineCount != 'undefined') {
        mQuery('#TimelineCount').html(response.timelineCount);
    }
};

Mautic.leadOnUnload = function(id) {
    if (typeof MauticVars.moderatedIntervals['leadListLiveUpdate'] != 'undefined') {
        Mautic.clearModeratedInterval('leadListLiveUpdate');
    }

    if (typeof Mautic.mapObjects !== 'undefined') {
        delete Mautic.mapObjects;
    }
};

Mautic.getLeadId = function() {
    return mQuery('input#leadId').val();
}

Mautic.leadEmailOnLoad = function(container, response) {
    mQuery('[name="lead_quickemail"]').on('click.ajaxform', function() {
        var emailHtml = mQuery('.fr-iframe').contents();
        var textarea = mQuery(this).find('#lead_quickemail_body');
        mQuery.each(emailHtml.find('td, th, table'), function() {
            var td = mQuery(this);
            if (td.attr('fr-original-class')) {
                td.attr('class', td.attr('fr-original-class'));
                td.removeAttr('fr-original-class');
            }
            if (td.attr('fr-original-style')) {
                td.attr('style', td.attr('fr-original-style'));
                td.removeAttr('fr-original-style');
            }
            if (td.css('border') === '1px solid rgb(221, 221, 221)') {
                td.css('border', '');
            }
        });
        textarea.val(emailHtml.find('html').get(0).outerHTML);
    });
}

Mautic.leadlistOnLoad = function(container) {
    if (mQuery(container + ' #list-search').length) {
        Mautic.activateSearchAutocomplete('list-search', 'lead.list');
    }

    if (mQuery('#leadlist_filters').length) {
        mQuery('#available_filters').on('change', function() {
            if (mQuery(this).val()) {
                Mautic.addLeadListFilter(mQuery(this).val());
                mQuery(this).val('');
                mQuery(this).trigger('chosen:updated');
            }
        });

        mQuery('#leadlist_filters .remove-selected').each( function (index, el) {
            mQuery(el).on('click', function () {
                mQuery(this).closest('.panel').animate(
                    {'opacity': 0},
                    'fast',
                    function () {
                        mQuery(this).remove();
                    }
                );

                if (!mQuery('#leadlist_filters li:not(.placeholder)').length) {
                    mQuery('#leadlist_filters li.placeholder').removeClass('hide');
                } else {
                    mQuery('#leadlist_filters li.placeholder').addClass('hide');
                }
            });
        });
    }
};

Mautic.leadlistPopulateChoices = function(el) {

    Mautic.ajaxActionRequest('lead:getLeadFieldsPerObject', {'object': mQuery(el).val()},
       function (response) {
            console.log(response);
        }
    );
};

Mautic.convertLeadFilterInput = function(el) {
    var operator = mQuery(el).val();
    console.log(el);
    // Extract the filter number
    var regExp    = /leadlist_filters_(\d+)_operator/;
    var matches   = regExp.exec(mQuery(el).attr('id'));
    var filterNum = matches[1];
    var filterId  = '#leadlist_filters_' + filterNum + '_filter';

    // Reset has-error
    if (mQuery(filterId).parent().hasClass('has-error')) {
        mQuery(filterId).parent().find('div.help-block').hide();
        mQuery(filterId).parent().removeClass('has-error');
    }

    var disabled = (operator == 'empty' || operator == '!empty') ? true : false;
    mQuery(filterId).prop('disabled', disabled);

    if (disabled) {
        mQuery(filterId).val('');
    }

    if (mQuery(filterId).is('select')) {
        var isMultiple  = mQuery(filterId).attr('multiple');
        var multiple    = (operator == 'in' || operator == '!in') ? true : false;
        var placeholder = mQuery(filterId).attr('data-placeholder');

        if (multiple && !isMultiple) {
            mQuery(filterId).attr('multiple', 'multiple');

            // Update the name
            var newName =  mQuery(filterId).attr('name') + '[]';
            mQuery(filterId).attr('name', newName);

            placeholder = mauticLang['chosenChooseMore'];
        } else if (!multiple && isMultiple) {
            mQuery(filterId).removeAttr('multiple');

            // Update the name
            var newName =  mQuery(filterId).attr('name').replace(/[\[\]']+/g,'')
            mQuery(filterId).attr('name', newName);

            placeholder = mauticLang['chosenChooseOne'];
        }

        if (multiple) {
            // Remove empty option
            mQuery(filterId).find('option[value=""]').remove();

            // Make sure none are selected
            mQuery(filterId + ' option:selected').removeAttr('selected');
        } else {
            // Add empty option
            mQuery(filterId).prepend("<option value='' selected></option>");
        }

        // Destroy the chosen and recreate
        if (mQuery(filterId + '_chosen').length) {
            mQuery(filterId).chosen('destroy');
        }

        mQuery(filterId).attr('data-placeholder', placeholder);

        Mautic.activateChosenSelect(mQuery(filterId));
    }
};

Mautic.addLeadListFilter = function (elId) {
    var filterId = '#available_' + elId;
    var label    = mQuery(filterId).text();

    //create a new filter

    var filterNum = parseInt(mQuery('.available-filters').data('index'));
    mQuery('.available-filters').data('index', filterNum + 1);

    var prototype = mQuery('.available-filters').data('prototype');
    var fieldType = mQuery(filterId).data('field-type');
    var fieldObject = mQuery(filterId).data('field-object');
    var isSpecial = (mQuery.inArray(fieldType, ['leadlist', 'lead_email_received', 'tags', 'multiselect', 'boolean', 'select', 'country', 'timezone', 'region', 'stage', 'locale']) != -1);

    prototype = prototype.replace(/__name__/g, filterNum);
    prototype = prototype.replace(/__label__/g, label);

    // Convert to DOM
    prototype = mQuery(prototype);

    var filterBase  = "leadlist[filters][" + filterNum + "]";
    var filterIdBase = "leadlist_filters_" + filterNum + "_";

    if (isSpecial) {
        var templateField = fieldType;
        if (fieldType == 'boolean' || fieldType == 'multiselect') {
            templateField = 'select';
        }

        var template = mQuery('#templates .' + templateField + '-template').clone();
        mQuery(template).attr('name', mQuery(template).attr('name').replace(/__name__/g, filterNum));
        mQuery(template).attr('id', mQuery(template).attr('id').replace(/__name__/g, filterNum));
        mQuery(prototype).find('input[name="' + filterBase + '[filter]"]').replaceWith(template);
    }

    if (mQuery('#leadlist_filters div.panel').length == 0) {
        // First filter so hide the glue footer
        mQuery(prototype).find(".panel-heading").addClass('hide');
    }

    if (fieldObject == 'company') {
        mQuery(prototype).find(".object-icon").removeClass('fa-user').addClass('fa-building');
    } else {
        mQuery(prototype).find(".object-icon").removeClass('fa-building').addClass('fa-user');
    }
    mQuery(prototype).find(".inline-spacer").append(fieldObject);

    mQuery(prototype).find("a.remove-selected").on('click', function() {
        mQuery(this).closest('.panel').animate(
            {'opacity': 0},
            'fast',
            function () {
                mQuery(this).remove();
            }
        );
    });

    mQuery(prototype).find("input[name='" + filterBase + "[field]']").val(elId);
    mQuery(prototype).find("input[name='" + filterBase + "[type]']").val(fieldType);
    mQuery(prototype).find("input[name='" + filterBase + "[object]']").val(fieldObject);

    var filterEl = (isSpecial) ? "select[name='" + filterBase + "[filter]']" : "input[name='" + filterBase + "[filter]']";

    mQuery(prototype).appendTo('#leadlist_filters');

    var filter = '#' + filterIdBase + 'filter';

    //activate fields
    if (isSpecial) {
        if (fieldType == 'select' || fieldType == 'multiselect' || fieldType == 'boolean') {
            // Generate the options
            var fieldOptions = mQuery(filterId).data("field-list");

            mQuery.each(fieldOptions, function(index, val) {
                mQuery('<option>').val(index).text(val).appendTo(filterEl);
            });
        }
    } else if (fieldType == 'lookup') {
        var fieldCallback = mQuery(filterId).data("field-callback");
        if (fieldCallback && typeof Mautic[fieldCallback] == 'function') {
            var fieldOptions = mQuery(filterId).data("field-list");
            Mautic[fieldCallback](filterIdBase + 'filter', elId, fieldOptions);
        }
    } else if (fieldType == 'datetime') {
        mQuery(filter).datetimepicker({
            format: 'Y-m-d H:i',
            lazyInit: true,
            validateOnBlur: false,
            allowBlank: true,
            scrollInput: false
        });
    } else if (fieldType == 'date') {
        mQuery(filter).datetimepicker({
            timepicker: false,
            format: 'Y-m-d',
            lazyInit: true,
            validateOnBlur: false,
            allowBlank: true,
            scrollInput: false,
            closeOnDateSelect: true
        });
    } else if (fieldType == 'time') {
        mQuery(filter).datetimepicker({
            datepicker: false,
            format: 'H:i',
            lazyInit: true,
            validateOnBlur: false,
            allowBlank: true,
            scrollInput: false
        });
    } else if (fieldType == 'lookup_id') {
        //switch the filter and display elements
        var oldFilter = mQuery(filterEl);
        var newDisplay = mQuery(oldFilter).clone();
        mQuery(newDisplay).attr('name', filterBase + '[display]')
            .attr('id', filterIdBase + 'display');

        var oldDisplay = mQuery(prototype).find("input[name='" + filterBase + "[display]']");
        var newFilter = mQuery(oldDisplay).clone();
        mQuery(newFilter).attr('name', filterBase + '[filter]')
            .attr('id', filterIdBase + 'filter');

        mQuery(oldFilter).replaceWith(newFilter);
        mQuery(oldDisplay).replaceWith(newDisplay);

        var fieldCallback = mQuery(filterId).data("field-callback");
        if (fieldCallback && typeof Mautic[fieldCallback] == 'function') {
            var fieldOptions = mQuery(filterId).data("field-list");
            Mautic[fieldCallback](filterIdBase + 'display', elId, fieldOptions);
        }
    } else {
        mQuery(filter).attr('type', fieldType);
    }

    // Remove inapplicable operator types
    var operators = mQuery(filterId).data('field-operators');

    if (typeof operators.include != 'undefined') {
        mQuery('#' + filterIdBase + 'operator option').filter(function () {
            return mQuery.inArray(mQuery(this).val(), operators['include']) == -1
        }).remove();
    } else if (typeof operators.exclude != 'undefined') {
        mQuery('#' + filterIdBase + 'operator option').filter(function () {
            return mQuery.inArray(mQuery(this).val(), operators['exclude']) !== -1
        }).remove();
    }

    // Convert based on first option in list
    Mautic.convertLeadFilterInput('#' + filterIdBase + 'operator');
};

Mautic.leadfieldOnLoad = function (container) {
    if (mQuery(container + ' .leadfield-list').length) {
        var bodyOverflow = {};
        mQuery(container + ' .leadfield-list tbody').sortable({
            handle: '.fa-ellipsis-v',
            helper: function(e, ui) {
                ui.children().each(function() {
                    mQuery(this).width(mQuery(this).width());
                });

                // Fix body overflow that messes sortable up
                bodyOverflow.overflowX = mQuery('body').css('overflow-x');
                bodyOverflow.overflowY = mQuery('body').css('overflow-y');
                mQuery('body').css({
                    overflowX: 'visible',
                    overflowY: 'visible'
                });

                return ui;
            },
            scroll: false,
            axis: 'y',
            containment: container + ' .leadfield-list',
            stop: function(e, ui) {
                // Restore original overflow
                mQuery('body').css(bodyOverflow);

                // Get the page and limit
                mQuery.ajax({
                    type: "POST",
                    url: mauticAjaxUrl + "?action=lead:reorder&limit=" + mQuery('.pagination-limit').val() + '&page=' + mQuery('.pagination li.active a span').first().text(),
                    data: mQuery(container + ' .leadfield-list tbody').sortable("serialize")});
            }
        });
    }

    if (mQuery(container + ' form[name="leadfield"]').length) {
        Mautic.updateLeadFieldProperties(mQuery('#leadfield_type').val());
    }

};

Mautic.updateLeadFieldProperties = function(selectedVal) {
    var defaultValueField = mQuery('input#leadfield_defaultValue');

    if (selectedVal == 'lookup' || selectedVal == 'multiselect') {
        // Use select
        selectedVal = 'select';
    }

    if (mQuery('#field-templates .'+selectedVal).length) {
        mQuery('#leadfield_properties').html('');
        mQuery('#leadfield_properties')
            .append(
                mQuery(
                    mQuery('#field-templates .'+selectedVal).html()
                        .replace(/leadfield_properties_template/g, 'leadfield_properties')
                )
            );
        mQuery("#leadfield_properties *[data-toggle='sortablelist']").each(function (index) {
            Mautic.activateSortable(this);
        });
    } else if (!mQuery('#leadfield_properties .'+selectedVal).length) {
        mQuery('#leadfield_properties').html('');
    }

    if (selectedVal == 'time') {
        mQuery('#leadfield_isListable').closest('.row').addClass('hide');
    } else {
        mQuery('#leadfield_isListable').closest('.row').removeClass('hide');
    }

    // Switch default field if applicable
    var defaultFieldType = mQuery('input[name="leadfield[defaultValue]"]').attr('type');
    if (selectedVal == 'boolean') {
        if (defaultFieldType == 'text') {
            // Convert to a select
            var newDiv      = mQuery('<div id="leadfield_defaultValue"></div>');
            var defaultBool = mQuery('#field-templates .default_bool').html();
            defaultBool     = defaultBool.replace(/default_bool_template/g, 'defaultValue');

            mQuery(defaultBool).appendTo(newDiv);

            defaultValueField.replaceWith(newDiv);
        }
    } else if (defaultFieldType == 'radio') {
        // Convert to input
        var html = mQuery('#field-templates .default').html();
        html     = html.replace(/default_template/g, 'defaultValue');
        defaultValueField.replaceWith(html);
    }

    if (selectedVal === 'datetime' || selectedVal === 'date' || selectedVal === 'time') {
        Mautic.activateDateTimeInputs(defaultValueField, selectedVal);
    } else if (defaultValueField.hasClass('calendar-activated')) {
        defaultValueField.datetimepicker('destroy').removeClass('calendar-activated');
    }
};

Mautic.updateLeadFieldBooleanLabels = function(el, label) {
    mQuery('#leadfield_defaultValue_' + label).parent().find('span').text(
        mQuery(el).val()
    );
};

Mautic.refreshLeadSocialProfile = function(network, leadId, event) {
    var query = "action=lead:updateSocialProfile&network=" + network + "&lead=" + leadId;
    mQuery.ajax({
        showLoadingBar: true,
        url: mauticAjaxUrl,
        type: "POST",
        data: query,
        dataType: "json",
        success: function (response) {
            if (response.success) {
                if (response.completeProfile) {
                    mQuery('#social-container').html(response.completeProfile);
                    mQuery('#SocialCount').html(response.socialCount);
                } else {
                    //loop through each network
                    mQuery.each(response.profiles, function (index, value) {
                        if (mQuery('#' + index + 'CompleteProfile').length) {
                            mQuery('#' + index + 'CompleteProfile').html(value.newContent);
                        }
                    });
                }
            }
            Mautic.stopPageLoadingBar();
            Mautic.stopIconSpinPostEvent();
        },
        error: function (request, textStatus, errorThrown) {
            Mautic.processAjaxError(request, textStatus, errorThrown);
        }
    });
};

Mautic.clearLeadSocialProfile = function(network, leadId, event) {
    Mautic.startIconSpinOnEvent(event);
    var query = "action=lead:clearSocialProfile&network=" + network + "&lead=" + leadId;
    mQuery.ajax({
        url: mauticAjaxUrl,
        type: "POST",
        data: query,
        dataType: "json",
        success: function (response) {
            if (response.success) {
                //activate the click to remove the panel
                mQuery('.' + network + '-panelremove').click();
                if (response.completeProfile) {
                    mQuery('#social-container').html(response.completeProfile);
                }
                mQuery('#SocialCount').html(response.socialCount);
            }

            Mautic.stopIconSpinPostEvent();
        },
        error: function (request, textStatus, errorThrown) {
            Mautic.processAjaxError(request, textStatus, errorThrown);
            Mautic.stopIconSpinPostEvent();
        }
    });
};

Mautic.refreshLeadTimeline = function(form) {
    Mautic.postForm(mQuery(form), function (response) {
        response.target = '#timeline-table';
        mQuery('#TimelineCount').html(response.timelineCount);
        Mautic.processPageContent(response);
    });
};

Mautic.refreshLeadNotes = function(form) {
    Mautic.postForm(mQuery(form), function (response) {
        response.target = '#NoteList';
        mQuery('#NoteCount').html(response.noteCount);
        Mautic.processPageContent(response);
    });
};

Mautic.toggleLeadList = function(toggleId, leadId, listId) {
    var action = mQuery('#' + toggleId).hasClass('fa-toggle-on') ? 'remove' : 'add';
    var query = "action=lead:toggleLeadList&leadId=" + leadId + "&listId=" + listId + "&listAction=" + action;

    Mautic.toggleLeadSwitch(toggleId, query, action);
};

Mautic.toggleCompanyLead = function(toggleId, leadId, companyId) {
    var action = mQuery('#' + toggleId).hasClass('fa-toggle-on') ? 'remove' : 'add';
    var query = "action=lead:toggleCompanyLead&leadId=" + leadId + "&companyId=" + companyId + "&companyAction=" + action;

    Mautic.toggleLeadSwitch(toggleId, query, action);
};

Mautic.toggleLeadCampaign = function(toggleId, leadId, campaignId) {
    var action = mQuery('#' + toggleId).hasClass('fa-toggle-on') ? 'remove' : 'add';
    var query  = "action=lead:toggleLeadCampaign&leadId=" + leadId + "&campaignId=" + campaignId + "&campaignAction=" + action;

    Mautic.toggleLeadSwitch(toggleId, query, action);
};

Mautic.toggleLeadSwitch = function(toggleId, query, action) {
    var toggleOn  = 'fa-toggle-on text-success';
    var toggleOff = 'fa-toggle-off text-danger';
    var spinClass = 'fa-spin fa-spinner ';

    if (action == 'remove') {
        //switch it on
        mQuery('#' + toggleId).removeClass(toggleOn).addClass(spinClass + 'text-danger');
    } else {
        mQuery('#' + toggleId).removeClass(toggleOff).addClass(spinClass + 'text-success');
    }

    mQuery.ajax({
        url: mauticAjaxUrl,
        type: "POST",
        data: query,
        dataType: "json",
        success: function (response) {
            mQuery('#' + toggleId).removeClass(spinClass);
            if (!response.success) {
                //return the icon back
                if (action == 'remove') {
                    //switch it on
                    mQuery('#' + toggleId).removeClass(toggleOff).addClass(toggleOn);
                } else {
                    mQuery('#' + toggleId).removeClass(toggleOn).addClass(toggleOff);
                }
            } else {
                if (action == 'remove') {
                    //switch it on
                    mQuery('#' + toggleId).removeClass(toggleOn).addClass(toggleOff);
                } else {
                    mQuery('#' + toggleId).removeClass(toggleOff).addClass(toggleOn);
                }
            }
        },
        error: function (request, textStatus, errorThrown) {
            //return the icon back
            mQuery('#' + toggleId).removeClass(spinClass);

            if (action == 'remove') {
                //switch it on
                mQuery('#' + toggleId).removeClass(toggleOff).addClass(toggleOn);
            } else {
                mQuery('#' + toggleId).removeClass(toggleOn).addClass(toggleOff);
            }
        }
    });
};

Mautic.leadNoteOnLoad = function (container, response) {
    if (response.noteHtml) {
        var el = '#LeadNote' + response.noteId;
        if (mQuery(el).length) {
            mQuery(el).replaceWith(response.noteHtml);
        } else {
            mQuery('#LeadNotes').prepend(response.noteHtml);
        }

        //initialize ajax'd modals
        mQuery(el + " *[data-toggle='ajaxmodal']").off('click.ajaxmodal');
        mQuery(el + " *[data-toggle='ajaxmodal']").on('click.ajaxmodal', function (event) {
            event.preventDefault();

            Mautic.ajaxifyModal(this, event);
        });

        //initiate links
        mQuery(el + " a[data-toggle='ajax']").off('click.ajax');
        mQuery(el + " a[data-toggle='ajax']").on('click.ajax', function (event) {
            event.preventDefault();

            return Mautic.ajaxifyLink(this, event);
        });
    } else if (response.deleteId && mQuery('#LeadNote' + response.deleteId).length) {
        mQuery('#LeadNote' + response.deleteId).remove();
    }

    if (response.upNoteCount || response.noteCount || response.downNoteCount) {
        if (response.upNoteCount || response.downNoteCount) {
            var count = parseInt(mQuery('#NoteCount').html());
            count = (response.upNoteCount) ? count + 1 : count - 1;
        } else {
            var count = parseInt(response.noteCount);
        }

        mQuery('#NoteCount').html(count);
    }
};

Mautic.showSocialMediaImageModal = function(imgSrc) {
    mQuery('#socialImageModal img').attr('src', imgSrc);
    mQuery('#socialImageModal').modal('show');
};

Mautic.leadImportOnLoad = function (container, response) {
    if (!mQuery('#leadImportProgress').length) {
        Mautic.clearModeratedInterval('leadImportProgress');
    } else {
        Mautic.setModeratedInterval('leadImportProgress', 'reloadLeadImportProgress', 3000);
    }
};

Mautic.reloadLeadImportProgress = function() {
    if (!mQuery('#leadImportProgress').length) {
        Mautic.clearModeratedInterval('leadImportProgress');
    } else {
        // Get progress separate so there's no delay while the import batches
        Mautic.ajaxActionRequest('lead:getImportProgress', {}, function(response) {
            if (response.progress) {
                if (response.progress[0] > 0) {
                    mQuery('.imported-count').html(response.progress[0]);
                    mQuery('.progress-bar-import').attr('aria-valuenow', response.progress[0]).css('width', response.percent + '%');
                    mQuery('.progress-bar-import span.sr-only').html(response.percent + '%');
                }
            }
        });

        // Initiate import
        mQuery.ajax({
            showLoadingBar: false,
            url: window.location + '?importbatch=1',
            success: function(response) {
                Mautic.moderatedIntervalCallbackIsComplete('leadImportProgress');

                if (response.newContent) {
                    // It's done so pass to process page
                    Mautic.processPageContent(response);
                }
            }
        });
    }
};

Mautic.removeBounceStatus = function (el, dncId) {
    mQuery(el).removeClass('fa-times').addClass('fa-spinner fa-spin');

    Mautic.ajaxActionRequest('lead:removeBounceStatus', 'id=' + dncId, function() {
        mQuery('#bounceLabel' + dncId).tooltip('destroy');
        mQuery('#bounceLabel' + dncId).fadeOut(300, function() { mQuery(this).remove(); });
    });
};

Mautic.toggleLiveLeadListUpdate = function () {
    if (typeof MauticVars.moderatedIntervals['leadListLiveUpdate'] == 'undefined') {
        Mautic.setModeratedInterval('leadListLiveUpdate', 'updateLeadList', 5000);
        mQuery('#liveModeButton').addClass('btn-primary');
    } else {
        Mautic.clearModeratedInterval('leadListLiveUpdate');
        mQuery('#liveModeButton').removeClass('btn-primary');
    }
};

Mautic.updateLeadList = function () {
    var maxLeadId = mQuery('#liveModeButton').data('max-id');
    mQuery.ajax({
        url: mauticAjaxUrl,
        type: "get",
        data: "action=lead:getNewLeads&maxId=" + maxLeadId,
        dataType: "json",
        success: function (response) {
            if (response.leads) {
                if (response.indexMode == 'list') {
                    mQuery('#leadTable tbody').prepend(response.leads);
                } else {
                    var items = mQuery(response.leads);
                    mQuery('.shuffle-grid').prepend(items);
                    mQuery('.shuffle-grid').shuffle('appended', items);
                    mQuery('.shuffle-grid').shuffle('update');

                    mQuery('#liveModeButton').data('max-id', response.maxId);
                }
            }

            if (typeof IdleTimer != 'undefined' && !IdleTimer.isIdle()) {
                // Remove highlighted classes
                if (response.indexMode == 'list') {
                    mQuery('#leadTable tr.warning').each(function() {
                        var that = this;
                        setTimeout(function() {
                            mQuery(that).removeClass('warning', 1000)
                        }, 5000);
                    });
                } else {
                    mQuery('.shuffle-grid .highlight').each(function() {
                        var that = this;
                        setTimeout(function() {
                            mQuery(that).removeClass('highlight', 1000, function() {
                                mQuery(that).css('border-top-color', mQuery(that).data('color'));
                            })
                        }, 5000);
                    });
                }
            }

            if (response.maxId) {
                mQuery('#liveModeButton').data('max-id', response.maxId);
            }

            Mautic.moderatedIntervalCallbackIsComplete('leadListLiveUpdate');
        },
        error: function (request, textStatus, errorThrown) {
            Mautic.processAjaxError(request, textStatus, errorThrown);

            Mautic.moderatedIntervalCallbackIsComplete('leadListLiveUpdate');
        }
    });
};

Mautic.toggleAnonymousLeads = function() {
    var searchValue = mQuery('#list-search').typeahead('val');
    var string      = mQuery('#anonymousLeadButton').data('anonymous').toLowerCase();

    if (searchValue.toLowerCase().indexOf('!' + string) == 0) {
        searchValue = searchValue.replace('!' + string, string);
        mQuery('#anonymousLeadButton').addClass('btn-primary');
    } else if (searchValue.toLowerCase().indexOf(string) == -1) {
        if (searchValue) {
            searchValue = searchValue + ' ' + string;
        } else {
            searchValue = string;
        }
        mQuery('#anonymousLeadButton').addClass('btn-primary');
    } else {
        searchValue = mQuery.trim(searchValue.replace(string, ''));
        mQuery('#anonymousLeadButton').removeClass('btn-primary');
    }
    searchValue = searchValue.replace("  ", " ");
    Mautic.setSearchFilter(null, 'list-search', searchValue);
};

Mautic.getLeadEmailContent = function (el) {
    Mautic.activateLabelLoadingIndicator('lead_quickemail_templates');
    mQuery('#MauticSharedModal .btn-primary').prop('disabled', true);
    Mautic.ajaxActionRequest('lead:getEmailTemplate', {'template': mQuery(el).val()}, function(response) {
        mQuery('#MauticSharedModal .btn-primary').prop('disabled', false);
        mQuery('#lead_quickemail_body').froalaEditor('html.set', response.body);
        mQuery('#lead_quickemail_body').val(response.body);
        mQuery('#lead_quickemail_subject').val(response.subject);
        Mautic.removeLabelLoadingIndicator();
    });
};

Mautic.updateLeadTags = function () {
    Mautic.activateLabelLoadingIndicator('lead_tags_tags');
    var formData = mQuery('form[name="lead_tags"]').serialize();
    Mautic.ajaxActionRequest('lead:updateLeadTags', formData, function(response) {
        if (response.tags) {
            mQuery('#lead_tags_tags').html(response.tags);
            mQuery('#lead_tags_tags').trigger('chosen:updated');
        }
        Mautic.removeLabelLoadingIndicator();
    });
};

Mautic.createLeadTag = function (el) {
    var newFound = false;
    mQuery('#' + mQuery(el).attr('id') + ' :selected').each(function(i, selected) {
        if (!mQuery.isNumeric(mQuery(selected).val())) {
            newFound = true;
        }
    });

    if (!newFound) {
        return;
    }

    Mautic.activateLabelLoadingIndicator(mQuery(el).attr('id'));

    var tags = JSON.stringify(mQuery(el).val());

    Mautic.ajaxActionRequest('lead:addLeadTags', {tags: tags}, function(response) {
        if (response.tags) {
            mQuery('#' + mQuery(el).attr('id')).html(response.tags);
            mQuery('#' + mQuery(el).attr('id')).trigger('chosen:updated');
        }

        Mautic.removeLabelLoadingIndicator();
    });
};

Mautic.createLeadUtmTag = function (el) {
    var newFound = false;
    mQuery('#' + mQuery(el).attr('id') + ' :selected').each(function(i, selected) {
        if (!mQuery.isNumeric(mQuery(selected).val())) {
            newFound = true;
        }
    });

    if (!newFound) {
        return;
    }

    Mautic.activateLabelLoadingIndicator(mQuery(el).attr('id'));

    var utmtags = JSON.stringify(mQuery(el).val());

    Mautic.ajaxActionRequest('lead:addLeadUtmTags', {utmtags: utmtags}, function(response) {
        if (response.tags) {
            mQuery('#' + mQuery(el).attr('id')).html(response.utmtags);
            mQuery('#' + mQuery(el).attr('id')).trigger('chosen:updated');
        }

        Mautic.removeLabelLoadingIndicator();
    });
};

Mautic.leadBatchSubmit = function() {
    if (Mautic.batchActionPrecheck()) {
        if (mQuery('#lead_batch_remove').val() || mQuery('#lead_batch_add').val() || mQuery('#lead_batch_dnc_reason').length || mQuery('#lead_batch_stage_addstage').length) {
            var ids = Mautic.getCheckedListIds(false, true);

            if (mQuery('#lead_batch_ids').length) {
                mQuery('#lead_batch_ids').val(ids);
            } else if (mQuery('#lead_batch_dnc_reason').length) {
                mQuery('#lead_batch_dnc_ids').val(ids);
            } else if (mQuery('#lead_batch_stage_addstage').length) {
                mQuery('#lead_batch_stage_ids').val(ids);
            }

            return true;
        }

    }

    mQuery('#MauticSharedModal').modal('hide');

    return false;
};

Mautic.updateLeadFieldValues = function (field) {
    Mautic.activateLabelLoadingIndicator('campaignevent_properties_field');

    field = mQuery(field);
    var fieldAlias = field.val();
    Mautic.ajaxActionRequest('lead:updateLeadFieldValues', {'alias': fieldAlias}, function(response) {
        if (typeof response.options != 'undefined') {
            var valueField = mQuery('#campaignevent_properties_value');
            var valueFieldAttrs = {
                'class': valueField.attr('class'),
                'id': valueField.attr('id'),
                'name': valueField.attr('name'),
                'autocomplete': valueField.attr('autocomplete'),
                'value': valueField.attr('value')
            };

            if (mQuery('#campaignevent_properties_value_chosen').length) {
                mQuery('#campaignevent_properties_value').chosen('destroy');
            }

            if (!mQuery.isEmptyObject(response.options)) {
                var newValueField = mQuery('<select/>')
                    .attr('class', valueFieldAttrs['class'])
                    .attr('id', valueFieldAttrs['id'])
                    .attr('name', valueFieldAttrs['name'])
                    .attr('autocomplete', valueFieldAttrs['autocomplete'])
                    .attr('value', valueFieldAttrs['value']);
                mQuery.each(response.options, function(optionKey, optionVal) {
                    var option = mQuery("<option/>")
                        .attr('value', optionKey)
                        .text(optionVal);
                    newValueField.append(option);
                });
                valueField.replaceWith(newValueField);

                Mautic.activateChosenSelect(newValueField);
            } else {
                var newValueField = mQuery('<input/>')
                    .attr('type', 'text')
                    .attr('class', valueFieldAttrs['class'])
                    .attr('id', valueFieldAttrs['id'])
                    .attr('name', valueFieldAttrs['name'])
                    .attr('autocomplete', valueFieldAttrs['autocomplete'])
                    .attr('value', valueFieldAttrs['value']);

                valueField.replaceWith(newValueField);
            }
        }
        Mautic.removeLabelLoadingIndicator();
    });
};

Mautic.toggleTimelineMoreVisiblity = function (el) {
    if (mQuery(el).is(':visible')) {
        mQuery(el).slideUp('fast');
        mQuery(el).next().text(mauticLang['showMore']);
    } else {
        mQuery(el).slideDown('fast');
        mQuery(el).next().text(mauticLang['hideMore']);
    }
};

Mautic.displayUniqueIdentifierWarning = function (el) {
    if (mQuery(el).val() === "0") {
        mQuery('.unique-identifier-warning').fadeOut('fast');
    } else {
        mQuery('.unique-identifier-warning').fadeIn('fast');
    }
};

Mautic.initUniqueIdentifierFields = function() {
    var uniqueFields = mQuery('[data-unique-identifier]');
    if (uniqueFields.length) {
        uniqueFields.on('change', function() {
            var input = mQuery(this);
            var request = {
                field: input.data('unique-identifier'),
                value: input.val(),
                ignore: mQuery('#lead_unlockId').val()
            };
            Mautic.ajaxActionRequest('lead:getLeadIdsByFieldValue', request, function(response) {
                if (response.items !== 'undefined' && response.items.length) {
                    var warning = mQuery('<div class="exists-warning" />').text(response.existsMessage);
                    mQuery.each(response.items, function(i, item) {
                        if (i > 0) {
                            warning.append(mQuery('<span>, </span>'));
                        }

                        var link = mQuery('<a/>')
                            .attr('href', item.link)
                            .attr('target', '_blank')
                            .text(item.name+' ('+item.id+')');
                        warning.append(link);
                    });
                    warning.appendTo(input.parent());
                } else {
                    input.parent().find('div.exists-warning').remove();
                }
            });
        });
    }
};

Mautic.updateFilterPositioning = function (el) {
    var $el = mQuery(el);
    var $parentEl = $el.closest('.panel');

    if ($el.val() == 'and') {
        $parentEl.addClass('in-group');
    } else {
        $parentEl.removeClass('in-group');
    }
};