/**
 *
 * Union Bridge Drum Co. Stave Calculator
 * Project Management & Presets Module
 *
 * Features:
 * - Drum size presets
 * - URL parameter sharing
 * - Project save/load (localStorage)
 *
 */

var projects = {

  STORAGE_KEY: 'ubdc_projects',

  /**
   * Get all form field names that should be saved/loaded
   */
  getFieldNames: function() {
    return [
      'unit', 'stave_count', 'shell_diameter', 'extra', 'shell_depth',
      'board_thickness', 'board_width', 'board_cost',
      'crosscut_kerf', 'rip_kerf', 'waste_factor'
    ];
  },

  /**
   * Get current form values as an object
   */
  getFormValues: function() {
    var values = {};
    this.getFieldNames().forEach(function(name) {
      var $el = $('[name="' + name + '"]');
      if ($el.length) {
        values[name] = $el.val();
        // Also save unit data attribute for inputs
        if ($el.data('unit')) {
          values[name + '_unit'] = $el.data('unit');
        }
      }
    });
    return values;
  },

  /**
   * Set form values from an object
   */
  setFormValues: function(values) {
    var self = this;
    this.getFieldNames().forEach(function(name) {
      if (values.hasOwnProperty(name)) {
        var $el = $('[name="' + name + '"]');
        if ($el.length) {
          $el.val(values[name]);
          // Restore unit data attribute if present
          if (values[name + '_unit']) {
            $el.data('unit', values[name + '_unit']);
            // Update the unit display span
            $el.siblings('span.unit, span.add-on.unit').text(values[name + '_unit']);
          }
        }
      }
    });
    // Update unit selector and all unit displays
    if (values.unit) {
      $('select[name=unit]').val(values.unit).trigger('change');
    }
  },

  /**
   * Generate a shareable URL with current form values
   */
  generateShareUrl: function() {
    var values = this.getFormValues();
    var params = new URLSearchParams();

    for (var key in values) {
      if (values.hasOwnProperty(key) && values[key] !== '' && values[key] !== null) {
        params.set(key, values[key]);
      }
    }

    return window.location.origin + window.location.pathname + '?' + params.toString();
  },

  /**
   * Load form values from URL parameters
   */
  loadFromUrl: function() {
    var params = new URLSearchParams(window.location.search);
    var hasParams = false;
    var values = {};

    this.getFieldNames().forEach(function(name) {
      if (params.has(name)) {
        values[name] = params.get(name);
        hasParams = true;
      }
      // Check for unit data attributes
      if (params.has(name + '_unit')) {
        values[name + '_unit'] = params.get(name + '_unit');
      }
    });

    if (hasParams) {
      this.setFormValues(values);
      return true;
    }
    return false;
  },

  /**
   * Copy text to clipboard
   */
  copyToClipboard: function(text, callback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        if (callback) callback(true);
      }).catch(function() {
        if (callback) callback(false);
      });
    } else {
      // Fallback for older browsers
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        if (callback) callback(true);
      } catch (e) {
        if (callback) callback(false);
      }
      document.body.removeChild(textarea);
    }
  },

  /**
   * Get all saved projects from localStorage
   */
  getSavedProjects: function() {
    try {
      var data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error loading projects:', e);
      return {};
    }
  },

  /**
   * Save a project to localStorage
   */
  saveProject: function(name) {
    if (!name || name.trim() === '') {
      return false;
    }

    try {
      var projects = this.getSavedProjects();
      projects[name] = {
        name: name,
        values: this.getFormValues(),
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      return true;
    } catch (e) {
      console.error('Error saving project:', e);
      return false;
    }
  },

  /**
   * Load a project from localStorage
   */
  loadProject: function(name) {
    var projects = this.getSavedProjects();
    if (projects[name]) {
      this.setFormValues(projects[name].values);
      return true;
    }
    return false;
  },

  /**
   * Delete a project from localStorage
   */
  deleteProject: function(name) {
    try {
      var projects = this.getSavedProjects();
      if (projects[name]) {
        delete projects[name];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        return true;
      }
    } catch (e) {
      console.error('Error deleting project:', e);
    }
    return false;
  },

  /**
   * Apply a preset (diameter and depth)
   */
  applyPreset: function(presetValue) {
    if (!presetValue) return;

    var parts = presetValue.split(',');
    if (parts.length === 2) {
      var diameter = parseFloat(parts[0]);
      var depth = parseFloat(parts[1]);

      // Check current unit and convert if needed
      var unit = $('select[name=unit]').val();
      var r = new ruler();

      if (unit === 'cm') {
        diameter = r.toCentimeters(diameter);
        depth = r.toCentimeters(depth);
      }

      var $diameter = $('input[name=shell_diameter]');
      var $depth = $('input[name=shell_depth]');

      $diameter.val(diameter.toFixed($diameter.data('precision') || 2));
      $depth.val(depth.toFixed($depth.data('precision') || 2));
    }
  },

  /**
   * Initialize all event handlers
   */
  init: function() {
    var self = this;

    // Preset dropdown handler
    $('#preset').on('change', function() {
      var value = $(this).val();
      if (value) {
        self.applyPreset(value);
        // Reset dropdown to placeholder
        $(this).val('');
      }
    });

    // Share URL button
    $('#shareUrl').on('click', function() {
      var url = self.generateShareUrl();
      self.copyToClipboard(url, function(success) {
        var $btn = $('#shareUrl');
        var originalHtml = $btn.html();

        if (success) {
          $btn.html('<i class="icon-ok"></i> Copied!');
          $btn.addClass('btn-success');
        } else {
          // Show URL in prompt as fallback
          window.prompt('Copy this URL:', url);
        }

        setTimeout(function() {
          $btn.html(originalHtml);
          $btn.removeClass('btn-success');
        }, 2000);
      });
    });

    // Save project button
    $('#saveProject').on('click', function() {
      $('#projectModalLabel').text('Save Project');
      $('#saveForm').show();
      $('#loadList').hide();
      $('#confirmSave').show();
      $('#deleteProject').hide();
      $('#projectName').val('');
      $('#projectModal').modal('show');
    });

    // Confirm save button
    $('#confirmSave').on('click', function() {
      var name = $('#projectName').val().trim();
      if (name) {
        if (self.saveProject(name)) {
          $('#projectModal').modal('hide');
          // Show success feedback
          var $btn = $('#saveProject');
          var originalHtml = $btn.html();
          $btn.html('<i class="icon-ok"></i> Saved!');
          $btn.addClass('btn-success');
          setTimeout(function() {
            $btn.html(originalHtml);
            $btn.removeClass('btn-success');
          }, 2000);
        }
      } else {
        $('#projectName').focus();
      }
    });

    // Load project button
    $('#loadProject').on('click', function() {
      self.renderProjectList();
      $('#projectModalLabel').text('Load Project');
      $('#saveForm').hide();
      $('#loadList').show();
      $('#confirmSave').hide();
      $('#projectModal').modal('show');
    });

    // Delete project button in modal
    $('#deleteProject').on('click', function() {
      var name = $(this).data('project');
      if (name && confirm('Delete project "' + name + '"?')) {
        self.deleteProject(name);
        self.renderProjectList();
      }
    });

    // Load from URL on page load
    if (this.loadFromUrl()) {
      // Auto-submit form if URL params were loaded
      setTimeout(function() {
        $('#staveform').submit();
      }, 100);
    }
  },

  /**
   * Render the project list in the modal
   */
  renderProjectList: function() {
    var self = this;
    var projects = this.getSavedProjects();
    var $list = $('#projectList');
    var $noProjects = $('#noProjects');
    var $deleteBtn = $('#deleteProject');

    $list.empty();
    $deleteBtn.hide().data('project', '');

    var projectNames = Object.keys(projects);

    if (projectNames.length === 0) {
      $noProjects.show();
      return;
    }

    $noProjects.hide();

    // Sort by saved date (newest first)
    projectNames.sort(function(a, b) {
      return new Date(projects[b].savedAt) - new Date(projects[a].savedAt);
    });

    projectNames.forEach(function(name) {
      var project = projects[name];
      var date = new Date(project.savedAt);
      var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

      var $item = $('<li><a href="#">' +
        '<strong>' + self.escapeHtml(name) + '</strong>' +
        '<br><small class="muted">' + dateStr + '</small>' +
        '</a></li>');

      $item.find('a').on('click', function(e) {
        e.preventDefault();
        self.loadProject(name);
        $('#projectModal').modal('hide');
        // Auto-calculate after loading
        setTimeout(function() {
          $('#staveform').submit();
        }, 100);
      });

      // Show delete button on hover
      $item.on('mouseenter', function() {
        $deleteBtn.show().data('project', name);
      });

      $list.append($item);
    });
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml: function(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

};

// Initialize on document ready
$(document).ready(function() {
  projects.init();
});
