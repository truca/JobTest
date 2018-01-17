
export default class Fetcher {
  route
  dispatch
  defaultHeaders = {'content-type': 'application/json'}
  constructor(route, dispatch){
    this.route = route
    this.dispatch = dispatch
  }
  get(path, headers, actionThunk){
    return this.operation(path, {
      method: 'GET',
      headers: Object.assign({}, this.defaultHeaders, headers),
    }, actionThunk)
  }
  delete(path, headers, actionThunk){
    return this.operation(path, {
      method: 'DELETE',
      headers: Object.assign({}, this.defaultHeaders, headers),
    }, actionThunk)
  }
  post(path, headers, actionThunk, data){
    return this.operation(path, {
      method: 'POST',
      headers: Object.assign({}, this.defaultHeaders, headers),
      body: JSON.stringify(data),
    }, actionThunk)
  }
  put(path, headers, actionThunk, data){
    return this.operation(path, {
      method: 'PUT',
      headers: Object.assign({}, this.defaultHeaders, headers),
      body: JSON.stringify(data),
    }, actionThunk)
  }
  patch(path, headers, actionThunk, data){
    return this.operation(path, {
      method: 'PATCH',
      headers: Object.assign({}, this.defaultHeaders, headers),
      body: JSON.stringify(data),
    }, actionThunk)
  }
  operation(path, configuration, actionThunk){
    return fetch(path.indexOf('http') !== -1? path : `${this.route}${path}`, configuration)
      .then(res => {
        //console.log(`res ${path}`, res)
        var responseParsed = res._bodyInit? JSON.parse(res._bodyInit) : res._bodyInit
        //console.log(`result ${path}`, configuration, responseParsed)
        //console.log(`result ${path}`, Array.isArray(responseParsed)? responseParsed.length : Object.keys(responseParsed)) 
        this.dispatch( actionThunk(responseParsed))
        return responseParsed
      })
  }
}