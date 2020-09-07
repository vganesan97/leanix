import 'alpinejs'
import '@leanix/reporting'
import './assets/tailwind.css'

const  state = {
  // variable to hold the graphql query response
  response: null,
  // array that will hold the transformed response, in form of rows
  rows: [],
  // array to store the table's columns key and label
  columns: [],
  costss: [],
  // variable to hold the computed average completion ratio for all factsheets
  avgCompletion:  'n/a'
}

const methods = {
  async initializeReport () {
    await lx.init()
    await lx.ready({})
  },
  async fetchGraphQLData () {
    // to be implemented...
    const query = `
    {
  allFactSheets(filter: {facetFilters: [{facetKey: "FactSheetTypes", keys: ["ITComponent"]}, {facetKey: "hierarchyLevel", keys: ["1"]}]}) {
    edges {
      node {
        ... on ITComponent {
          name
          relITComponentToApplication {
            edges {
              node {
                costTotalAnnual
              }
            }
          }
        }
      }
    }
  }
}`
    lx.showSpinner()
    try {
      this.response = await lx.executeGraphQL(query)
      this.mapResponseToRows()
    } finally {
      lx.hideSpinner()
    }
  },
  mapResponseToRows () {
    // to be implemented
    if (this.response === null) return
    // destructure the this.response state variable, extracting the allFactSheets.edges array
    this
    this.rows = this.response.allFactSheets.edges // <- this is an Array
      // and map each edge into its node attribute
      .map(edge => {
        let { name, relITComponentToApplication } = edge.node
        var cost = relITComponentToApplication.edges
          .map(edge => {
            let { costTotalAnnual } = edge.node
            return costTotalAnnual
          }).reduce((a, b) => a + b, 0)
        return {name, cost}
      }) // <- this is the Array map operator applied to it
      this.computeTableColumns()
  },
  computeTableColumns () {
    // to be implemented
    const  columnKeys = ['name', 'cost']
    this.columns = columnKeys
      .map(key  => ({ key, label:  lx.translateField("cost", key) }))
  }
}

window.initializeContext = () => {
  return {
    ...state,
    ...methods
  }
}