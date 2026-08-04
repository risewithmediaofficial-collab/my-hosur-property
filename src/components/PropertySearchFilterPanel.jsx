import LocationCascadeFilter from "./LocationCascadeFilter";
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
  const fields = propertyFilterConfig[category] || propertyFilterConfig.plot || [];

  const update = (key, value) => {
    if (typeof key === "object" && key !== null) onFieldChange(key);
    else onFieldChange(key, value);
  };

  return (
    <div className="property-filter-panel space-y-6">
      {/* 1. Common Location Cascading Filters (Applicable to All Property Types) */}
      <div className="property-filter-block">
        <p className="property-filter-heading">Location Details</p>
        <p className="property-filter-sub">Select country, state, district, taluk, village, and locality.</p>
        <div className="mt-3">
          <LocationCascadeFilter values={values} update={update} />
        </div>
      </div>

      {/* Category Selection */}
      {showCategoryPicker ? (
        <div className="property-filter-block">
          <p className="property-filter-heading">Property Category</p>
          <p className="property-filter-sub">Choose property category to update available filters.</p>
          <div className="property-filter-category-list mt-3">
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

      {/* Dynamic Property Filter Fields */}
      {fields.map((field) => {
        const selectedCount =
          field.type === "checkbox"
            ? splitValues(getFieldValue(values, field.key)).length
            : field.type === "rangePresets" && (values[field.minKey] || values[field.maxKey])
              ? 1
              : field.type === "dimensions" && (values[field.lengthKey] || values[field.widthKey])
                ? 1
                : field.type === "maintenance" && (values[field.amountKey] || values[field.statusKey])
                  ? 1
                  : getFieldValue(values, field.key)
                    ? 1
                    : 0;

        return (
          <div key={field.key} className="property-filter-block">
            <div className="property-filter-section-head mb-2.5">
              <h3 className="property-filter-section-title text-sm font-bold text-navy">{field.label}</h3>
              {selectedCount > 0 ? (
                <span className="property-filter-section-count">{selectedCount}</span>
              ) : null}
            </div>
            <FieldControl field={field} values={values} update={update} category={category} />
          </div>
        );
      })}
    </div>
  );
};

const FieldControl = ({ field, values, update, category }) => {
  if (field.type === "checkbox") {
    let optionsToRender = field.options;

    // Commercial Category: Commercial Building -> RERA Approved ONLY; Commercial Land / Default -> HNTDA, DTCP, RERA
    if (field.key === "approval" && category === "commercial") {
      const selectedPurpose = splitValues(getFieldValue(values, "purpose"));
      if (selectedPurpose.includes("Commercial Building") && !selectedPurpose.includes("Commercial Land")) {
        optionsToRender = ["RERA Approved"];
      }
    }

    const selected = splitValues(getFieldValue(values, field.key));
    return (
      <div className="property-filter-chip-grid">
        {optionsToRender.map((option) => {
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
      <div className="property-filter-segment flex gap-2">
        {field.options.map((option) => (
          <button
            key={option}
            type="button"
            className={`property-filter-segment-btn flex-1 py-2 text-xs font-semibold rounded-lg border ${
              current === option ? "is-on bg-navy text-white border-navy" : "bg-white text-slate-700 border-slate-200"
            }`}
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
        className="property-filter-input property-filter-select w-full"
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

  if (field.type === "dimensions") {
    const lengthVal = values[field.lengthKey] || "";
    const widthVal = values[field.widthKey] || "";
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Length (ft)</label>
          <input
            type="text"
            className="property-filter-input w-full"
            placeholder="e.g. 40"
            value={lengthVal}
            onChange={(e) => update(field.lengthKey, e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Width (ft)</label>
          <input
            type="text"
            className="property-filter-input w-full"
            placeholder="e.g. 30"
            value={widthVal}
            onChange={(e) => update(field.widthKey, e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (field.type === "maintenance") {
    const amountVal = values[field.amountKey] || "";
    const statusVal = values[field.statusKey] || "";
    return (
      <div className="space-y-2.5">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Maintenance Status</label>
          <div className="flex gap-2">
            {field.options.map((option) => (
              <button
                key={option}
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                  statusVal === option ? "bg-orange text-white border-orange" : "bg-white text-slate-700 border-slate-200"
                }`}
                onClick={() => update(field.statusKey, statusVal === option ? "" : option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Amount (₹)</label>
          <input
            type="number"
            className="property-filter-input w-full"
            placeholder="e.g. 2000"
            value={amountVal}
            onChange={(e) => update(field.amountKey, e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (field.type === "rangePresets") {
    const minKey = field.minKey;
    const maxKey = field.maxKey;
    const minVal = Number(values[minKey]) || 0;
    const maxVal = Number(values[maxKey]) || 0;

    const activePreset = (field.presets || []).find(
      (p) => String(p.min) === String(values[minKey]) && String(p.max || "") === String(values[maxKey] || "")
    );

    return (
      <div className="property-filter-budget space-y-3">
        <div className="property-filter-chip-grid property-filter-chip-grid-budget">
          {(field.presets || []).map((preset) => {
            const isSelected = activePreset?.label === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                className={`property-filter-chip property-filter-chip-sm ${isSelected ? "is-on" : ""}`}
                onClick={() => {
                  if (isSelected) {
                    update({
                      [minKey]: "",
                      [maxKey]: "",
                    });
                  } else {
                    update({
                      [minKey]: preset.min ? String(preset.min) : "",
                      [maxKey]: preset.max ? String(preset.max) : "",
                    });
                  }
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="property-filter-range-box pt-1">
          <div className="property-filter-range-labels text-xs font-semibold text-slate-600 flex justify-between">
            <span>Min: {minVal ? `₹${minVal >= 100000 ? `${(minVal / 100000).toFixed(1)} L` : minVal}` : "Any"}</span>
            <span>Max: {maxVal ? `₹${maxVal >= 100000 ? `${(maxVal / 100000).toFixed(1)} L` : maxVal}` : "Any"}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PropertySearchFilterPanel;
