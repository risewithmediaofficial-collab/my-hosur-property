import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  PROPERTY_FILTER_CATEGORIES,
  propertyFilterConfig,
} from "../constants/propertyFilterConfig";
import {
  getFieldValue,
  splitValues,
  toggleCheckboxValue,
} from "../utils/propertyFilters";

const PropertySearchFilterPanel = ({
  category,
  values,
  onCategoryChange,
  onFieldChange,
  showCategoryPicker = true,
}) => {
  const fields = propertyFilterConfig[category] || [];

  const update = (key, value) => {
    if (typeof key === "object" && key !== null) onFieldChange(key);
    else onFieldChange(key, value);
  };

  return (
    <div className="property-filter-panel">
      {showCategoryPicker ? (
        <div className="property-filter-block">
          <p className="property-filter-heading">Search your property</p>
          <p className="property-filter-sub">Choose a category, then pick filters below.</p>
          <div className="property-filter-category-list">
            {PROPERTY_FILTER_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onCategoryChange(item.id)}
                className={`property-filter-category-item ${category === item.id ? "is-active" : ""}`}
              >
                <span className="property-filter-category-dot" aria-hidden />
                <span className="property-filter-category-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {fields.map((field) => {
        const selectedCount =
          field.type === "checkbox"
            ? splitValues(getFieldValue(values, field.key)).length
            : field.type === "rangePresets" && (values[field.minKey] || values[field.maxKey])
              ? 1
              : getFieldValue(values, field.key)
                ? 1
                : 0;

        return (
          <div key={field.key} className="property-filter-block">
            <div className="property-filter-section-head">
              <h3 className="property-filter-section-title">{field.label}</h3>
              {selectedCount > 0 ? (
                <span className="property-filter-section-count">{selectedCount}</span>
              ) : null}
            </div>
            <FieldControl field={field} values={values} update={update} />
          </div>
        );
      })}
    </div>
  );
};

const FieldControl = ({ field, values, update }) => {
  if (field.type === "search") {
    const listId = `location-${field.key}`;
    return (
      <div className="property-filter-search-wrap">
        <MagnifyingGlassIcon className="property-filter-search-icon" />
        <input
          type="search"
          list={listId}
          className="property-filter-input property-filter-input-search"
          placeholder="Search locality..."
          value={getFieldValue(values, field.key)}
          onChange={(e) => update(field.key, e.target.value)}
        />
        <datalist id={listId}>
          {(field.suggestions || []).map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const selected = splitValues(getFieldValue(values, field.key));
    return (
      <div className="property-filter-chip-grid">
        {field.options.map((option) => {
          const isOn = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`property-filter-chip ${isOn ? "is-on" : ""}`}
              onClick={() => update(field.key, toggleCheckboxValue(getFieldValue(values, field.key), option))}
              aria-pressed={isOn}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "radio") {
    const current = getFieldValue(values, field.key);
    return (
      <div className="property-filter-segment">
        {field.options.map((option) => (
          <button
            key={option}
            type="button"
            className={`property-filter-segment-btn ${current === option ? "is-on" : ""}`}
            onClick={() => update(field.key, option)}
            aria-pressed={current === option}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <select
        className="property-filter-input property-filter-select"
        value={getFieldValue(values, field.key)}
        onChange={(e) => update(field.key, e.target.value)}
      >
        <option value="">Any</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "rangePresets") {
    const minKey = field.minKey;
    const maxKey = field.maxKey;
    const minVal = Number(values[minKey]) || 0;
    const maxVal = Number(values[maxKey]) || 0;
    const maxSlider = 100000000;

    const activePreset = (field.presets || []).find(
      (p) => String(p.min) === String(values[minKey]) && String(p.max || "") === String(values[maxKey] || "")
    );

    return (
      <div className="property-filter-budget">
        <div className="property-filter-chip-grid property-filter-chip-grid-budget">
          {(field.presets || []).map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`property-filter-chip property-filter-chip-sm ${activePreset?.label === preset.label ? "is-on" : ""}`}
              onClick={() =>
                update({
                  [minKey]: preset.min ? String(preset.min) : "",
                  [maxKey]: preset.max ? String(preset.max) : "",
                })
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="property-filter-range-box">
          <div className="property-filter-range-labels">
            <span>Min ₹{(minVal / 100000).toFixed(1)} L</span>
            <span>Max {maxVal ? `₹${(maxVal / 100000).toFixed(1)} L` : "Any"}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxSlider}
            step={100000}
            value={minVal}
            className="property-filter-range"
            onChange={(e) => update(minKey, e.target.value)}
            aria-label="Minimum budget"
          />
          <input
            type="range"
            min={0}
            max={maxSlider}
            step={100000}
            value={maxVal || maxSlider}
            className="property-filter-range"
            onChange={(e) => update(maxKey, e.target.value)}
            aria-label="Maximum budget"
          />
        </div>
      </div>
    );
  }

  return null;
};

export default PropertySearchFilterPanel;
