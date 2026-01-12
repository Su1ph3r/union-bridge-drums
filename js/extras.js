/**
 * Union Bridge Drum Co. Stave Calculator
 * Extra Calculators & Features Module
 *
 * Features:
 * - Bearing Edge Calculator
 * - Lug/Hardware Spacing Calculator
 * - Comparison Mode
 * - Dark Mode Toggle
 */

var extras = {

  DARK_MODE_KEY: 'ubdc_dark_mode',

  /**
   * Bearing edge types and their properties
   */
  bearingEdgeTypes: {
    '45-single': {
      name: '45° Single Cut',
      description: 'Standard modern edge, bright attack',
      outerAngle: 45,
      innerAngle: 0,
      roundover: 0
    },
    '45-double': {
      name: '45° Double Cut',
      description: 'Balanced tone, versatile',
      outerAngle: 45,
      innerAngle: 45,
      roundover: 0
    },
    'roundover': {
      name: 'Full Roundover',
      description: 'Warm, vintage tone',
      outerAngle: 0,
      innerAngle: 0,
      roundover: 1
    },
    'vintage': {
      name: 'Vintage Round',
      description: '30° with roundover, warm sustain',
      outerAngle: 30,
      innerAngle: 0,
      roundover: 0.5
    }
  },

  /**
   * Calculate bearing edge dimensions
   */
  calculateBearingEdge: function(shellThickness, edgeType) {
    var edge = this.bearingEdgeTypes[edgeType];
    if (!edge) return null;

    var results = {
      type: edge.name,
      description: edge.description,
      outerAngle: edge.outerAngle,
      innerAngle: edge.innerAngle
    };

    // Calculate edge width based on angle and thickness
    if (edge.outerAngle > 0) {
      results.outerCutWidth = (shellThickness * Math.tan(edge.outerAngle * Math.PI / 180)).toFixed(3);
    } else {
      results.outerCutWidth = '0';
    }

    if (edge.innerAngle > 0) {
      results.innerCutWidth = (shellThickness * Math.tan(edge.innerAngle * Math.PI / 180)).toFixed(3);
    } else {
      results.innerCutWidth = '0';
    }

    // Contact point width (where head touches)
    if (edge.roundover > 0) {
      results.contactWidth = (shellThickness * edge.roundover * 0.5).toFixed(3);
      results.roundoverRadius = (shellThickness * edge.roundover * 0.25).toFixed(3);
    } else {
      results.contactWidth = '0.030'; // Typical sharp edge contact
      results.roundoverRadius = '0';
    }

    // Router bit recommendation
    if (edge.outerAngle === 45) {
      results.routerBit = '45° Chamfer bit';
    } else if (edge.outerAngle === 30) {
      results.routerBit = '30° Chamfer bit or custom jig';
    } else if (edge.roundover > 0) {
      var radius = parseFloat(results.roundoverRadius);
      results.routerBit = (radius * 2).toFixed(2) + '" Roundover bit';
    } else {
      results.routerBit = 'N/A';
    }

    return results;
  },

  /**
   * Calculate lug/hardware spacing
   */
  calculateLugSpacing: function(diameter, lugCount, offsetFromEdge) {
    if (lugCount < 4 || lugCount > 20) return null;

    var circumference = Math.PI * diameter;
    var angleBetweenLugs = 360 / lugCount;
    var arcLength = circumference / lugCount;

    // Drill circle diameter (where lug holes sit)
    var drillCircleDiameter = diameter; // Lugs typically at shell edge

    return {
      lugCount: lugCount,
      angleBetweenLugs: angleBetweenLugs.toFixed(2),
      arcLength: arcLength.toFixed(3),
      circumference: circumference.toFixed(3),
      offsetFromEdge: offsetFromEdge,
      // Position of each lug (angle from 0°)
      lugPositions: this.generateLugPositions(lugCount),
      // Helpful drilling template info
      drillCircleDiameter: drillCircleDiameter.toFixed(3),
      drillCircleCircumference: (Math.PI * drillCircleDiameter).toFixed(3)
    };
  },

  /**
   * Generate lug position angles
   */
  generateLugPositions: function(count) {
    var positions = [];
    var angle = 360 / count;
    for (var i = 0; i < count; i++) {
      positions.push((i * angle).toFixed(1) + '°');
    }
    return positions;
  },

  /**
   * Initialize dark mode
   */
  initDarkMode: function() {
    var self = this;

    // Check saved preference
    var savedMode = localStorage.getItem(this.DARK_MODE_KEY);

    // Check system preference if no saved preference
    if (savedMode === null) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        savedMode = 'dark';
      }
    }

    if (savedMode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      this.updateDarkModeButton(true);
    }

    // Toggle button handler
    $('#darkModeToggle').on('click', function() {
      self.toggleDarkMode();
    });

    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addListener(function(e) {
        if (localStorage.getItem(self.DARK_MODE_KEY) === null) {
          if (e.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
          self.updateDarkModeButton(e.matches);
        }
      });
    }
  },

  /**
   * Toggle dark mode
   */
  toggleDarkMode: function() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(this.DARK_MODE_KEY, 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(this.DARK_MODE_KEY, 'dark');
    }

    this.updateDarkModeButton(!isDark);
  },

  /**
   * Update dark mode button text/icon
   */
  updateDarkModeButton: function(isDark) {
    var $btn = $('#darkModeToggle');
    if (isDark) {
      $btn.html('<i class="icon-sun"></i> Light');
      $btn.attr('title', 'Switch to light mode');
    } else {
      $btn.html('<i class="icon-moon"></i> Dark');
      $btn.attr('title', 'Switch to dark mode');
    }
  },

  /**
   * Comparison mode state
   */
  comparisonData: {
    configA: null,
    configB: null
  },

  /**
   * Save current config for comparison
   */
  saveForComparison: function(slot) {
    var r = new ruler();
    var s = new stave();

    // Read current form values
    $('#staveform').find('input').each(function() {
      var parsed = r.parseFraction($(this).val());
      if ($(this).data('unit') === 'cm') {
        parsed = r.toInches(parsed);
      }
      s[$(this).attr('name')] = parsed;
    });

    var config = {
      name: slot === 'A' ? 'Config A' : 'Config B',
      inputs: {
        stave_count: s.stave_count,
        shell_diameter: $('input[name=shell_diameter]').val(),
        shell_depth: $('input[name=shell_depth]').val(),
        board_thickness: $('input[name=board_thickness]').val()
      },
      results: {
        stave_count: s.stave_count,
        joint_angle: s.jointAngle().toFixed(2),
        bevel_angle: s.bevelAngle().toFixed(2),
        outer_dimension: s.outerDimension().toFixed(3),
        inner_dimension: s.innerDimension().toFixed(3),
        board_feet: s.boardFeetRequired().toFixed(2),
        cost: s.shellCost().toFixed(2)
      }
    };

    if (slot === 'A') {
      this.comparisonData.configA = config;
    } else {
      this.comparisonData.configB = config;
    }

    this.renderComparison();
  },

  /**
   * Render comparison table
   */
  renderComparison: function() {
    var a = this.comparisonData.configA;
    var b = this.comparisonData.configB;

    if (!a && !b) {
      $('#comparisonPanel').removeClass('active');
      return;
    }

    $('#comparisonPanel').addClass('active');

    var html = '<table class="table table-bordered table-condensed comparison-table">';
    html += '<thead><tr><th>Measurement</th>';
    html += '<th class="config-a">' + (a ? a.inputs.shell_diameter + ' × ' + a.inputs.shell_depth : 'Config A') + '</th>';
    html += '<th class="config-b">' + (b ? b.inputs.shell_diameter + ' × ' + b.inputs.shell_depth : 'Config B') + '</th>';
    html += '<th>Difference</th></tr></thead><tbody>';

    var fields = [
      { key: 'stave_count', label: 'Stave Count', unit: '' },
      { key: 'joint_angle', label: 'Joint Angle', unit: '°' },
      { key: 'bevel_angle', label: 'Bevel Angle', unit: '°' },
      { key: 'outer_dimension', label: 'Outer Width', unit: '"' },
      { key: 'inner_dimension', label: 'Inner Width', unit: '"' },
      { key: 'board_feet', label: 'Board Feet', unit: "'" },
      { key: 'cost', label: 'Cost', unit: '', prefix: '$' }
    ];

    fields.forEach(function(field) {
      var valA = a ? a.results[field.key] : '-';
      var valB = b ? b.results[field.key] : '-';
      var diff = '-';

      if (a && b) {
        var numA = parseFloat(a.results[field.key]);
        var numB = parseFloat(b.results[field.key]);
        var diffVal = numB - numA;
        if (diffVal !== 0) {
          diff = '<span class="comparison-diff">' + (diffVal > 0 ? '+' : '') + diffVal.toFixed(2) + '</span>';
        } else {
          diff = '0';
        }
      }

      var prefix = field.prefix || '';
      html += '<tr>';
      html += '<th>' + field.label + '</th>';
      html += '<td>' + (a ? prefix + valA + field.unit : '-') + '</td>';
      html += '<td>' + (b ? prefix + valB + field.unit : '-') + '</td>';
      html += '<td>' + diff + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    html += '<button class="btn btn-small" id="clearComparison"><i class="icon-remove"></i> Clear</button>';

    $('#comparisonResults').html(html);

    // Bind clear button
    var self = this;
    $('#clearComparison').on('click', function() {
      self.comparisonData.configA = null;
      self.comparisonData.configB = null;
      self.renderComparison();
    });
  },

  /**
   * Initialize bearing edge calculator
   */
  initBearingEdge: function() {
    var self = this;

    $('#calcBearingEdge').on('click', function() {
      var r = new ruler();
      var thickness = r.parseFraction($('input[name=board_thickness]').val());
      var unit = $('input[name=board_thickness]').data('unit');

      if (unit === 'cm') {
        thickness = r.toInches(thickness);
      }

      var edgeType = $('#bearingEdgeType').val();
      var results = self.calculateBearingEdge(thickness, edgeType);

      if (results) {
        var html = '<dl class="calc-results">';
        html += '<dt>Edge Type</dt><dd>' + results.type + '</dd>';
        html += '<dt>Description</dt><dd>' + results.description + '</dd>';
        html += '<dt>Outer Cut Angle</dt><dd>' + results.outerAngle + '°</dd>';
        html += '<dt>Outer Cut Width</dt><dd>' + results.outerCutWidth + '"</dd>';
        if (parseFloat(results.innerCutWidth) > 0) {
          html += '<dt>Inner Cut Angle</dt><dd>' + results.innerAngle + '°</dd>';
          html += '<dt>Inner Cut Width</dt><dd>' + results.innerCutWidth + '"</dd>';
        }
        html += '<dt>Contact Width</dt><dd>' + results.contactWidth + '"</dd>';
        if (parseFloat(results.roundoverRadius) > 0) {
          html += '<dt>Roundover Radius</dt><dd>' + results.roundoverRadius + '"</dd>';
        }
        html += '<dt>Router Bit</dt><dd>' + results.routerBit + '</dd>';
        html += '</dl>';
        $('#bearingEdgeResults').html(html);
      }
    });
  },

  /**
   * Initialize lug spacing calculator
   */
  initLugSpacing: function() {
    var self = this;

    $('#calcLugSpacing').on('click', function() {
      var r = new ruler();
      var diameter = r.parseFraction($('input[name=shell_diameter]').val());
      var unit = $('input[name=shell_diameter]').data('unit');

      if (unit === 'cm') {
        diameter = r.toInches(diameter);
      }

      var lugCount = parseInt($('#lugCount').val(), 10);
      var offset = r.parseFraction($('#lugOffset').val()) || 1;

      var results = self.calculateLugSpacing(diameter, lugCount, offset);

      if (results) {
        var html = '<dl class="calc-results">';
        html += '<dt>Number of Lugs</dt><dd>' + results.lugCount + '</dd>';
        html += '<dt>Angle Between Lugs</dt><dd>' + results.angleBetweenLugs + '°</dd>';
        html += '<dt>Arc Length Between Lugs</dt><dd>' + results.arcLength + '"</dd>';
        html += '<dt>Shell Circumference</dt><dd>' + results.circumference + '"</dd>';
        html += '<dt>Lug Positions</dt><dd>' + results.lugPositions.join(', ') + '</dd>';
        html += '</dl>';
        $('#lugSpacingResults').html(html);
      }
    });
  },

  /**
   * Initialize comparison mode
   */
  initComparison: function() {
    var self = this;

    $('#saveConfigA').on('click', function() {
      self.saveForComparison('A');
      $(this).html('<i class="icon-ok"></i> Saved A').addClass('btn-success');
      setTimeout(function() {
        $('#saveConfigA').html('Save as A').removeClass('btn-success');
      }, 1500);
    });

    $('#saveConfigB').on('click', function() {
      self.saveForComparison('B');
      $(this).html('<i class="icon-ok"></i> Saved B').addClass('btn-success');
      setTimeout(function() {
        $('#saveConfigB').html('Save as B').removeClass('btn-success');
      }, 1500);
    });
  },

  /**
   * Initialize print functionality
   */
  initPrint: function() {
    $('#printResults').on('click', function() {
      // Add print date
      var now = new Date();
      $('#results').attr('data-print-date', now.toLocaleDateString() + ' ' + now.toLocaleTimeString());
      window.print();
    });
  },

  /**
   * Initialize all extras
   */
  init: function() {
    this.initDarkMode();
    this.initBearingEdge();
    this.initLugSpacing();
    this.initComparison();
    this.initPrint();
  }
};

// Initialize on document ready
$(document).ready(function() {
  extras.init();
});
