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
      allFactSheets(filter: {facetFilters: [{facetKey: "FactSheetTypes", keys: ["UserGroup"]}, {facetKey: "hierarchyLevel", keys: ["1"]}]}) {
        edges {
          node {
            name
            ... on UserGroup {
              relUserGroupToApplication {
                edges {
                  node {
                    factSheet {
                      name
                      type
                      ... on Application {
                        relApplicationToITComponent {
                          edges{
                            node{
                              costTotalAnnual
                            }
                          }
                        }
                      }
                    }
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

        let { name, relUserGroupToApplication } = edge.node

        var apps = relUserGroupToApplication.edges
          .map(edge => {
            return {Application: edge.node.factSheet.name, TotalCost: edge.node.factSheet.relApplicationToITComponent.edges
              .map(elem => {
                return elem.node.costTotalAnnual
              }).reduce((a, b) => a + b, 0) }
          })

        var test = relUserGroupToApplication.edges
          .map(edge => {
            return edge.node.factSheet.relApplicationToITComponent.edges.f
              
          })
        
        var test1 = "$"+ apps
          .map(obj => {
            return obj.TotalCost
          }).reduce((a, b) => a + b, 0).toString() 
          
        var final = apps
          .map(obj => {
            var string =  `${obj.Application} : $${obj.TotalCost} \n`
            return string
          }).join('')
          /*.map(edge => {
            let { id, factSheet } = edge.node
            return factSheet.relApplicationtoITComponent.edges
              .map(edge => {
                let { costTotalAnnual } = edge.node
                return costTotalAnnual
              })
            }).reduce((a, b) => a + b, 0)*/
        return { "Application : Cost": final, "User Group": name, "Total Cost": test1, Applications: apps}
      }) // <- this is the Array map operator applied to it
      
      this.computeTableColumns()
  },
  computeTableColumns () {
    // to be implemented
    const  columnKeys = ['User Group', 'Application : Cost','Total Cost']
    this.columns = columnKeys
      .map(key  => ({ key, label:  lx.translateField("", key) }))
  }
}

window.initializeContext = () => {
  return {
    ...state,
    ...methods
  }
}