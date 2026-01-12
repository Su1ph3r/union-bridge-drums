/**
 *
 * Union Bridge Drum Co. Stave Calculator
 * Copyright 2012 Todd Treece
 * todd@unionbridge.org
 *
 * This file is part of the Union Bridge Drum Co. Stave Calculator.
 *
 * The Union Bridge Drum Co. Stave Calculator is free software:
 * you can redistribute it and/or modify it under the terms of
 * the GNU General Public License as published bythe Free
 * Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Union Bridge Drum Co. Stave Calculator is distributed
 * in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
 * Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with The Union Bridge Drum Co. Stave Calculator.  If not,
 * see <http://www.gnu.org/licenses/>.
 *
 */

function ruler() {

  this.base = 32;

  this.toFraction = function(inches) {

    var fraction = Math.floor(inches),
        numerator = Math.round( (inches % 1) * this.base ),
        denominator = this.base;

    while(numerator % 2 == 0 && numerator > 0) {

      numerator /= 2;
      denominator /= 2;

    }

    if (numerator > 0) {

      if(fraction != 0)
        fraction += ' ';
      else
        fraction = '';

      fraction += numerator + '/' + denominator;

    }

    return fraction;

  };

  this.toCentimeters = function(inches) {

    return inches * 2.54;

  };

  this.toInches = function(cm) {

    return cm / 2.54;

  };

  /**
   * Parse a string that may contain fractions into a decimal number
   * Accepts: "14", "14.5", "14 1/2", "14-1/2", "1/2", "14.5in", etc.
   */
  this.parseFraction = function(input) {
    if (typeof input === 'number') return input;
    if (!input || typeof input !== 'string') return NaN;

    // Remove units and trim
    var str = input.replace(/\s*(in|cm|"|'')\s*$/i, '').trim();

    // If it's just a number, return it
    if (/^-?\d+\.?\d*$/.test(str)) {
      return parseFloat(str);
    }

    // Check for fraction patterns
    // Pattern: "14 1/2" or "14-1/2" (whole number + fraction)
    var mixedMatch = str.match(/^(-?\d+)[\s\-]+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      var whole = parseInt(mixedMatch[1], 10);
      var num = parseInt(mixedMatch[2], 10);
      var den = parseInt(mixedMatch[3], 10);
      if (den === 0) return NaN;
      var sign = whole < 0 ? -1 : 1;
      return whole + sign * (num / den);
    }

    // Pattern: "1/2" (just a fraction)
    var fractionMatch = str.match(/^(-?\d+)\/(\d+)$/);
    if (fractionMatch) {
      var numerator = parseInt(fractionMatch[1], 10);
      var denominator = parseInt(fractionMatch[2], 10);
      if (denominator === 0) return NaN;
      return numerator / denominator;
    }

    // Try parsing as a regular number (fallback)
    return parseFloat(str);
  };

}

