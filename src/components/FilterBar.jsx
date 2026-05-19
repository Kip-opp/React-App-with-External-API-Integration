import './style/FilterBar.css';

import {
  REGIONS,
  CATEGORIES,
} from '../utils/constants';

function FilterBar({
  filters,
  onChange,
  showAdvanced = true,
}) {
  const handleChange = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <section className="filter-bar">
      <div className="filter-group">
        <label>Region</label>

        <select
          value={filters.region || ''}
          onChange={(e) =>
            handleChange('region', e.target.value)
          }
        >
          {REGIONS.map((region) => (
            <option
              key={region.value}
              value={region.value}
            >
              {region.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Category</label>

        <select
          value={filters.category || ''}
          onChange={(e) =>
            handleChange('category', e.target.value)
          }
        >
          {CATEGORIES.map((category) => (
            <option
              key={category.value}
              value={category.value}
            >
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {showAdvanced && (
        <>
          <div className="filter-group">
            <label>Source</label>

            <select
              value={filters.source || ''}
              onChange={(e) =>
                handleChange('source', e.target.value)
              }
            >
              <option value="">All Sources</option>
              <option value="eventbrite">
                Eventbrite
              </option>
              <option value="ticketmaster">
                Ticketmaster
              </option>
              <option value="local">
                Local Events
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label>Event Type</label>

            <select
              value={filters.event_type || ''}
              onChange={(e) =>
                handleChange(
                  'event_type',
                  e.target.value
                )
              }
            >
              <option value="">All Events</option>
              <option value="free">
                Free Events
              </option>
              <option value="paid">
                Paid Events
              </option>
              <option value="online">
                Online Events
              </option>
              <option value="in_person">
                In-Person Events
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>

            <select
              value={filters.sort || 'date'}
              onChange={(e) =>
                handleChange('sort', e.target.value)
              }
            >
              <option value="date">
                Upcoming First
              </option>
              <option value="popular">
                Most Popular
              </option>
              <option value="price_low">
                Lowest Price
              </option>
              <option value="price_high">
                Highest Price
              </option>
            </select>
          </div>
        </>
      )}
    </section>
  );
}

export default FilterBar;