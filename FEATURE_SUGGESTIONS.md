# Feature Suggestions for Union Bridge Drum Co. Stave Calculator

## Project Analysis Summary

The Stave Calculator is a well-designed tool that helps drum makers calculate:
- Stave dimensions (outer/inner width, angles)
- Material requirements (board feet, cost estimation)
- Shell geometry (diameter, depth, thickness)

Current strengths include multi-unit support (inches/cm/fractions), interactive SVG visualization, and comprehensive input parameters.

---

## Suggested New Features

### 1. **Project Save/Load & Sharing**
**Priority: High | Complexity: Low**

Allow users to save their calculations and share them with others.

**Implementation:**
- Save project to browser localStorage
- Generate shareable URL with parameters encoded (e.g., `?segments=12&diameter=14&depth=6.5`)
- Export/import JSON configuration files
- Named project list with quick-load dropdown

**Value:** Users often work on multiple drums and need to reference past calculations. Shareable URLs help collaboration in drum-making communities.

---

### 2. **Printable Cut List / PDF Export**
**Priority: High | Complexity: Medium**

Generate a printer-friendly document with all measurements and a cutting guide.

**Implementation:**
- Print stylesheet (`@media print`) for clean output
- "Print Cut List" button that triggers browser print dialog
- Optional: Use jsPDF for PDF generation
- Include: all measurements, diagram, material list, and notes field

**Value:** Woodworkers need physical reference sheets in the workshop where devices may not be practical.

---

### 3. **Common Drum Size Presets**
**Priority: High | Complexity: Low**

Quick-select buttons for standard drum sizes.

**Suggested presets:**
- **Snare drums:** 14"×5.5", 14"×6.5", 13"×7"
- **Toms:** 10"×8", 12"×9", 14"×14", 16"×16"
- **Bass drums:** 20"×16", 22"×18", 24"×14"

**Implementation:**
- Dropdown or button group above the form
- Clicking a preset fills in diameter and depth
- Allow users to save custom presets (localStorage)

**Value:** Speeds up workflow for common configurations and helps beginners learn standard sizes.

---

### 4. **Material/Wood Species Database**
**Priority: Medium | Complexity: Medium**

Add wood species selection with properties.

**Data per species:**
- Density (lbs/board foot)
- Typical cost range
- Acoustic characteristics (bright/warm/balanced)
- Hardness (Janka scale)
- Common names (Maple, Oak, Walnut, Mahogany, etc.)

**New calculations:**
- Estimated shell weight
- Acoustic profile suggestion

**Value:** Helps users understand material selection impact and estimate final drum weight.

---

### 5. **Bearing Edge Calculator**
**Priority: Medium | Complexity: Medium**

Calculate bearing edge dimensions - the profile where the drumhead contacts the shell.

**Parameters:**
- Edge type: 45° single, 45° double, roundover, vintage round
- Edge width
- Inner/outer cut dimensions

**Output:**
- Router bit size recommendations
- Cross-section diagram of edge profile
- Impact on drum tone (educational tooltip)

**Value:** Bearing edges are crucial for drum sound and are often calculated separately. Integration adds significant value.

---

### 6. **Hardware Spacing Calculator**
**Priority: Medium | Complexity: Low**

Calculate lug placement for drum hardware.

**Inputs:**
- Number of lugs (6, 8, 10)
- Lug hole offset from edge
- Lug type (tube, single-point)

**Output:**
- Angle between lugs
- Distance between lug holes (arc length)
- Drill template diagram

**Value:** Completes the drum-building workflow - users currently need separate tools for this.

---

### 7. **Side-View / 3D Visualization**
**Priority: Medium | Complexity: High**

Add alternative visualization perspectives.

**Options:**
- Side profile view (shows depth, bearing edges)
- 3D rotating view (Three.js or CSS 3D transforms)
- Exploded view showing individual stave
- Assembly animation

**Implementation:**
- Tab system to switch between views
- Consider Three.js for true 3D (larger dependency)
- Or CSS 3D transforms for simpler pseudo-3D

**Value:** Better spatial understanding of the final product, especially for beginners.

---

### 8. **Comparison Mode**
**Priority: Medium | Complexity: Medium**

Compare two or more drum configurations side-by-side.

**Features:**
- Split-screen or tabbed comparison
- Highlight differences (more/less material, cost delta)
- Compare: 12 vs 16 staves, different diameters, etc.

**Value:** Helps users make informed decisions about stave count and dimensions trade-offs.

---

### 9. **Cut Optimization / Nesting**
**Priority: Low | Complexity: High**

Optimize how staves are cut from boards to minimize waste.

**Features:**
- Visual board layout showing stave placement
- Support multiple board sizes
- Calculate actual vs. theoretical waste
- Suggest optimal board dimensions to purchase

**Value:** Advanced feature for production shops to minimize material costs.

---

### 10. **Reinforcement Ring Calculator**
**Priority: Low | Complexity: Medium**

Calculate dimensions for shell reinforcement rings.

**Parameters:**
- Ring width
- Ring thickness
- Position (top, bottom, or both)
- Same wood or different species

**Output:**
- Ring inner/outer diameter
- Additional board feet required
- Updated total cost

**Value:** Reinforcement rings are common in professional drums but require additional calculations.

---

### 11. **Progressive Web App (PWA) Support**
**Priority: Low | Complexity: Medium**

Enable offline use and mobile installation.

**Implementation:**
- Add service worker for offline caching
- Create manifest.json for installability
- App icon for home screen
- Works without internet after first load

**Value:** Workshop environments often have poor connectivity. Offline access is valuable.

---

### 12. **Measurement Input Flexibility**
**Priority: Low | Complexity: Low**

Allow users to input measurements in different formats.

**Accept:**
- Decimal: `14.5`
- Fractions: `14 1/2` or `14-1/2`
- Mixed: `14.5"` or `14.5 in`

**Implementation:**
- Parse input with regex
- Normalize to decimal internally
- Show converted value on blur

**Value:** Woodworkers often work in fractions; allowing direct input improves UX.

---

### 13. **Calculation History**
**Priority: Low | Complexity: Low**

Automatically save recent calculations.

**Features:**
- Last 10-20 calculations stored in localStorage
- Timestamp and key parameters shown
- One-click restore
- Clear history option

**Value:** Easy recovery if user navigates away or wants to revisit recent work.

---

### 14. **Educational Mode / Tooltips**
**Priority: Low | Complexity: Low**

Expand educational content for beginners.

**Additions:**
- "What is a stave drum?" intro section
- Video embed or link to tutorial
- Glossary of terms (kerf, bevel, joint angle)
- "Why does this matter?" tooltips on results

**Value:** Lowers barrier to entry for hobbyists new to drum building.

---

### 15. **Dark Mode**
**Priority: Low | Complexity: Low**

Add dark color scheme option.

**Implementation:**
- CSS variables for colors
- Toggle button in header
- Respect `prefers-color-scheme` media query
- Save preference in localStorage

**Value:** Popular UX feature, reduces eye strain in workshop lighting.

---

## Implementation Roadmap Suggestion

### Phase 1 - Quick Wins
1. Common drum size presets
2. URL parameter sharing
3. Print stylesheet
4. Calculation history

### Phase 2 - Core Enhancements
5. Project save/load
6. Bearing edge calculator
7. Hardware spacing calculator
8. Measurement input flexibility

### Phase 3 - Advanced Features
9. Material/wood species database
10. Side-view visualization
11. Comparison mode
12. PWA support

### Phase 4 - Production Features
13. Cut optimization
14. Reinforcement ring calculator
15. 3D visualization

---

## Technical Notes

**Current Stack Compatibility:**
- Most features can be implemented with existing vanilla JS + jQuery
- PDF export: consider jsPDF library
- 3D visualization: would require Three.js or similar
- PWA: requires service worker (modern JS, no dependencies)

**Suggested Modernization (Optional):**
- Migrate to modern ES6+ modules
- Add build tool (Vite/Parcel) for optimization
- Consider React/Vue for complex state management (comparison mode, etc.)
- TypeScript for calculation engine reliability

---

*Generated: January 2026*
*For: Union Bridge Drum Co. Stave Calculator*
