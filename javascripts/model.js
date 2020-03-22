class Model {
  constructor() {
    this.size = 25;
    this.start = [12,12];
    this.finish = [12,37 ];
    this.walls = new Set();
    this.weights = new Set();
  }

  changeGrid(size,newPoint,oldPoint) {
    this.size = size;
    this.start = [Math.floor(this.size/2),Math.floor(this.size/4*2)];
    this.finish = [Math.floor(this.size/2),Math.floor(this.size/4*6)];
    this.walls = new Set();
    this.weights = new Set();

    this.onSizeChanged(this.size, this.start, this.finish);
  };

  changePoints(newPoint,oldPoint){
    oldPoint = oldPoint.split(',');
    newPoint = newPoint.split(',');
    if (this.start[0] == parseInt(oldPoint[0]) && this.start[1] == parseInt(oldPoint[1])) {
      this.start[0] = parseInt(newPoint[0]);
      this.start[1] = parseInt(newPoint[1]);
    } else {
      this.finish[0] = parseInt(newPoint[0]);
      this.finish[1] = parseInt(newPoint[1]);
    }
  }


  bindOnSizeChanged(callback){
    this.onSizeChanged = callback
  }

  bindOnPathBuilt(callback){
    this.onPathBuilt = callback
  }

  bindOnMazeBuilt(callback){
    this.onMaseBuilt = callback
  }

  setWall(point,set){
    if (set) this.walls.add('[' + point + ']')
    else this.walls.delete('[' + point + ']')
  }

  setWeight(point,set){
    if (set) this.weights.add('[' + point + ']')
    else this.weights.delete('[' + point + ']')
  }

  buildRandomMaze(){
    this.walls = new Set()
    var points = []
    for (var i = 0; i < this.size*(this.size*2-1)/4; i++) {
      var y = (Math.floor(Math.random() * this.size))
      var x = (Math.floor(Math.random() * (this.size*2)))
      if (y==this.start[0] && x == this.start[1]) continue
      if (y==this.finish[0] && x == this.finish[1]) continue
      points.push([y,x])
      this.walls.add(JSON.stringify([y,x]))
    }
    this.onMaseBuilt(points)
  }

  buildRecursiveMaze(){
    this.walls = new Set()
    var upperLeft = [0,0]
    var bottomRight = [this.size-1, this.size*2-1]
    var start = this.start
    var finish = this.finish
    var points = []
    var holes = new Set()
    function recDiv([y1,x1],[y2,x2]){
      if  ((x2-x1)<2 || (y2-y1)<2) return
      if ((x2-x1)>(y2-y1)){
        var divisor = (Math.floor(Math.random() * (x2 - x1 - 1 )) + x1 + 1)
        var it = 0
        while (holes.has(JSON.stringify([y1-1,divisor])) || holes.has(JSON.stringify([y2+1,divisor]))) {
          it++
          divisor = (Math.floor(Math.random() * (x2 - x1 - 1 )) + x1 + 1)
          if (it>100) {
            console.log([y1-1,divisor], [y2+1,divisor])
            console.log("I tried")
            return
          }
        }
        var hole = Math.floor(Math.random() * (y2 - y1 + 1)) + y1;
        holes.add(JSON.stringify([hole,divisor]))
        for (var i = y1; i < y2+1; i++) {
          if (i==start[0] && divisor == start[1]) continue
          if (i==finish[0] && divisor == finish[1]) continue
          if (i!=hole) points.push([i,divisor])
        }
        recDiv([y1,x1],[y2,divisor-1])
        recDiv([y1,divisor+1],[y2,x2])
      } else {
        var divisor = (Math.floor(Math.random() * (y2 - y1 - 1)) + y1 + 1)
        var it = 0
        while (holes.has(JSON.stringify([divisor,x1-1])) || holes.has(JSON.stringify([divisor,x2+1]))) {
            it++
            divisor = (Math.floor(Math.random() * (y2 - y1 - 1 )) + y1 + 1)
            if (it>100) {
              console.log("I tried")
              return
            }
        }
        var hole = Math.floor(Math.random() * (x2 - x1 + 1)) + x1;
        holes.add(JSON.stringify([divisor,hole]))
        for (var i = x1; i < x2+1; i++) {
          if (divisor==start[0] && i == start[1]) continue
          if (divisor==finish[0] && i == finish[1]) continue
          if (i!=hole) points.push([divisor,i])
        }
        recDiv([y1,x1],[divisor-1,x2])
        recDiv([divisor+1,x1],[y2,x2])
      }
    }

    recDiv(upperLeft,bottomRight)
    points.forEach(item => this.walls.add(JSON.stringify(item)))
    this.onMaseBuilt(points)
  }

  _bfs(){
    var points = []
    var stack = [this.start]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    visited.add(JSON.stringify(this.start))
    function bfs() {
      while (stack.length>0) {
        var point = stack.shift()
        if (point[0] == finish[0] && point[1] == finish[1]) break
        points.push(point)
        for (var i = 0; i < directions.length; i++) {
          newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
          if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2 || visited.has(JSON.stringify(newPoint) )) {
            continue
          } else {
            if (walls.has(JSON.stringify(newPoint))) continue
            stack.push(newPoint)
            visited.add(JSON.stringify(newPoint))
            parentNode[JSON.stringify(newPoint)] = JSON.stringify(point)
          }
        }
      }
    }
    bfs()
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()
    return [points,shortestPath]
  }
  _dfs(){
    var points = []
    var stack = [this.start]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    var found = false
    function dfs(point,parent) {
      if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2) {
        return
      }
      if (visited.has(JSON.stringify(point)) || walls.has(JSON.stringify(point))) return
      if (parent){
        parentNode[JSON.stringify(point)] = JSON.stringify(parent)
      }
      if (point[0] == finish[0] && point[1] == finish[1]) {
        found = true
        return
      }
      if (found) return
      visited.add(JSON.stringify(point))

      points.push(point)
      for (var i = 0; i < directions.length; i++) {
        newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
        dfs(newPoint, point)
      }
    }
    dfs(this.start)
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()
    return [points,shortestPath]
  }

  _astar(){
    var points = []
    var stack = [[this.start,0,0]]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    var weights = this.weights
    visited.add(JSON.stringify(this.start))

    function heuristics(point, finish) {
      return Math.abs(point[0]-finish[0])+Math.abs(point[1]-finish[1])
    }

    function findMin(stack){
      var minIndex = 0
      var min = stack[0][1] + stack[0][2]
      for (var i = 0; i < stack.length; i++) {
        if (stack[i][1]+ stack[i][2]<min) {
          min = stack[i][1]+stack[i][2]
          minIndex = i
        }
      }
      return minIndex
    }

    function astar() {
      while (stack.length>0) {
        var min = findMin(stack)
        var point = stack[min][0]
        var weight = stack[min][1]
        stack.splice(min,1)


        if (point[0] == finish[0] && point[1] == finish[1]) break
        points.push(point)
        for (var i = 0; i < directions.length; i++) {
          newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
          if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2 || visited.has(JSON.stringify(newPoint) )) {
            continue
          } else {
            if (walls.has(JSON.stringify(newPoint))) continue
            if (weights.has(JSON.stringify(newPoint))){
              stack.unshift([newPoint,weight+15,heuristics(newPoint,finish)])
            } else {
              stack.unshift([newPoint,weight+1,heuristics(newPoint,finish)])
            }
            visited.add(JSON.stringify(newPoint))
            parentNode[JSON.stringify(newPoint)] = JSON.stringify(point)
          }
        }
      }
    }

    astar()
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()

    return [points,shortestPath]
  }

  _djikstra(){
    var points = []
    var stack = [[this.start,0]]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    var weights = this.weights
    visited.add(JSON.stringify(this.start))


    function findMin(stack){
      var minIndex = 0
      var min = stack[0][1]
      for (var i = 0; i < stack.length; i++) {
        if (stack[i][1]<min) {
          min = stack[i][1]
          minIndex = i
        }
      }
      return minIndex
    }

    function djikstra() {
      while (stack.length>0) {
        var min = findMin(stack)
        var point = stack[min][0]
        var weight = stack[min][1]
        stack.splice(min,1)
        if (point[0] == finish[0] && point[1] == finish[1]) break
        points.push(point)
        for (var i = 0; i < directions.length; i++) {
          newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
          if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2 || visited.has(JSON.stringify(newPoint) )) {
            continue
          } else {
            if (walls.has(JSON.stringify(newPoint))) continue
            if (weights.has(JSON.stringify(newPoint))){
              stack.push([newPoint,weight+15])
            } else {
              stack.push([newPoint,weight+1])
            }
            visited.add(JSON.stringify(newPoint))
            parentNode[JSON.stringify(newPoint)] = JSON.stringify(point)
          }
        }
      }
    }

    djikstra()
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()

    return [points,shortestPath]
  }

  _random(){
    var points = []
    var stack = [[this.start,0]]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    var weights = this.weights
    visited.add(JSON.stringify(this.start))


    function findMin(stack){
      var minIndex = 0
      var min = stack[0][1]
      for (var i = 0; i < stack.length; i++) {
        if (stack[i][1]<min) {
          min = stack[i][1]
          minIndex = i
        }
      }
      return minIndex
    }

    function random() {
      while (stack.length>0) {
        var min = findMin(stack)
        var point = stack[min][0]
        var weight = stack[min][1]
        stack.splice(min,1)
        if (point[0] == finish[0] && point[1] == finish[1]) break
        points.push(point)
        for (var i = 0; i < directions.length; i++) {
          newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
          if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2 || visited.has(JSON.stringify(newPoint) )) {
            continue
          } else {
            if (walls.has(JSON.stringify(newPoint))) continue
            var randWeight = Math.floor(Math.random()*1000)
            stack.push([newPoint,randWeight])
            visited.add(JSON.stringify(newPoint))
            parentNode[JSON.stringify(newPoint)] = JSON.stringify(point)
          }
        }
      }
    }

    random()
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()

    return [points,shortestPath]
  }

  visualize(algo){
    switch (algo) {
      case 'bfs':
        var results = this._bfs()
        break;
      case 'dfs':
          var results = this._dfs()
          break;
      case 'astar':
          var results = this._astar()
          break;
      case 'djikstra':
          var results = this._djikstra()
          break;
      case 'random':
          var results = this._random()
          break;
      default:
        var results = this._bfs()
    }

    var visited = results[0]
    var shortestPath = results[1]
    this.onPathBuilt(visited, shortestPath)
  }
}
