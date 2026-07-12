// Authoritative Miami-Dade data sources registry
// Used by Eleventy templates and Mia's knowledge system

module.exports = {
  government: [
    { name: 'Miami-Dade County',              url: 'https://www.miamidade.gov',                 icon: '🏛️', description: 'Official county government portal' },
    { name: 'City of Miami',                  url: 'https://www.miamigov.com',                  icon: '🌆', description: 'City of Miami official government' },
    { name: 'Miami Beach',                    url: 'https://www.miamibeachfl.gov',              icon: '🏖️', description: 'City of Miami Beach' },
    { name: 'Coral Gables',                   url: 'https://www.coralgables.com',               icon: '🌺', description: 'City of Coral Gables' },
  ],
  openData: [
    { name: 'Miami-Dade Open Data',           url: 'https://opendata.miamidade.gov',            icon: '📊', description: 'Official open data portal' },
    { name: 'Miami-Dade GIS',                 url: 'https://gis-mdc.opendata.arcgis.com',       icon: '🗺️', description: 'Geographic information & maps' },
    { name: 'OpenMiami',                      url: 'https://github.com/openmiami',              icon: '⚡', description: 'Community civic tech org' },
    { name: 'MiamiVerse / SustainaCities',    url: 'https://github.com/sustainacities',         icon: '🌿', description: 'Sustainability & city data platform' },
  ],
  services: [
    { name: 'Miami-Dade 311',                 url: 'https://311.miamidade.gov',                 icon: '📞', description: 'Report issues, request services' },
    { name: 'Miami-Dade Transit',             url: 'https://www.miamidade.gov/transit/',        icon: '🚇', description: 'Metrorail, Metrobus, Metromover' },
    { name: 'Miami-Dade Parks',               url: 'https://www.miamidade.gov/parks/',          icon: '🌳', description: 'Parks, beaches, recreation' },
    { name: 'Miami-Dade Libraries',           url: 'https://www.mdpls.org',                     icon: '📚', description: 'Public library system' },
    { name: 'Miami-Dade Schools',             url: 'https://www.dadeschools.net',               icon: '🎓', description: 'Miami-Dade County Public Schools' },
    { name: 'Property Appraiser',             url: 'https://www.miamidade.gov/propertysearch/', icon: '🏠', description: 'Property search & tax info' },
    { name: 'Clerk of Courts',                url: 'https://www.miamidadeclerk.com',            icon: '⚖️', description: 'Court records & filings' },
    { name: 'Miami-Dade Housing',             url: 'https://www.miamidade.gov/housing/',        icon: '🏘️', description: 'Affordable housing programs' },
    { name: 'Miami-Dade Health',              url: 'https://miamidade.gov/health',              icon: '🏥', description: 'Public health & clinics' },
  ],
  ecosystem: [
    { name: 'MiaGPT',                         url: 'https://github.com/sustainacities/miagpt',  icon: '🤖', description: 'This AI system — open source' },
    { name: 'OpenMiami Datasets',             url: 'https://github.com/openmiami',              icon: '📦', description: 'Civic datasets & tools' },
    { name: 'Miami Climate Action',           url: 'https://resilientmiami.com',                icon: '🌊', description: 'Climate resilience initiatives' },
  ],
  socrataDatasets: [
    { id: 'dj6j-qg5t', name: '311 Service Requests',       tags: ['311', 'complaints', 'services'] },
    { id: 'kdkv-6yw4', name: 'Transit Routes',             tags: ['transit', 'bus', 'routes'] },
    { id: 'vdsc-qgyd', name: 'Parks & Recreation',         tags: ['parks', 'recreation'] },
    { id: 'fzk7-h3dg', name: 'Building Permits',           tags: ['permits', 'construction', 'building'] },
    { id: 'v3j3-3iik', name: 'Public Schools',             tags: ['schools', 'education'] },
  ],
}
