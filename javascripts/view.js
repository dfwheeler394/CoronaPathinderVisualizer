class View {
  constructor() {
    this.app = this.getElement('root');
    this.grid = this.createElement('table', 'gridTable');
    this.rangePicker = this.getElement('rangePicker');
    this.algoPicker = this.getElement('algoPicker');
    this.visualizeButton = this.getElement('visualizeButton');
    this.clearBoardButton = this.getElement('clearBoard');
    this.clearPathButton = this.getElement('clearPath');
    this.recuresiveMazeButton = this.getElement('recuresiveMaze');
    this.randomMazeButton = this.getElement('randomMaze');
    this.app.append(this.grid)
  };

  getElement(id) {
    return document.getElementById(id);
  };

  createElement(tag, className) {
    var element = document.createElement(tag);
    for (var i = 1; i < arguments.length; i++) {
      element.classList.add(arguments[i]);
    }
    return element;
  }

  bindRangePicker(handler) {
    this.rangePicker.addEventListener('input', event => {
      handler(event.target.value);
    });
  };

  bindVisualizeButton(handler) {
    this.visualizeButton.addEventListener('click', event => {
      handler(event);
    });
  }

  bindClearBoardButton (handler) {
    this.clearBoardButton.addEventListener('click', event => {
      handler(event);
    });
  };

  bindClearPathButton () {
    this.clearPathButton.addEventListener('click', event => {
      this._clearTable();
    });
  };


  bindRecursiveMazeButton(handler) {
    this.recuresiveMazeButton.addEventListener('click', event => {
      this._clearTable(true);
      handler(event);
    });
  };

  bindRandomMazeButton(handler) {
    this.randomMazeButton.addEventListener('click', event => {
      this._clearTable(true);
      handler(event);
    });
  };


  bindOnPointChanged(callback) {
    this.onPointChanged = callback;
  };

  bindOnWallSet(callback) {
    this.onWallSet = callback;
  };

  bindOnWeightSet(callback) {
    this.onWeightSet = callback;
  };

  _initCellStartLocalEventListener(cell) {

      cell.addEventListener('dragstart', event => {
        event.dataTransfer.setData("text", event.currentTarget.id);
        this._clearTable();
      });
    };

  _initCellLocalEventListener(cell) {
      cell.addEventListener('dragover', event => {
        event.preventDefault();
      });

      cell.addEventListener('dragenter', event => {
        event.preventDefault();
        cell.setAttribute('class','onDrag');
      });

      cell.addEventListener('dragleave', event => {
        event.preventDefault();
        cell.removeAttribute('class','onDrag');
      });

      cell.addEventListener('drop', event => {
        event.preventDefault();
        var oldPointId = event.dataTransfer.getData("text");
        var oldPoint = document.getElementById(oldPointId);
        var newPoint = event.target;
        var newPointNoListeners = newPoint.cloneNode(true);
        newPoint.parentNode.replaceChild(newPointNoListeners, newPoint);
        if (oldPointId == this.startCell.id) {
          this.startCell = newPointNoListeners;
          this.startCell.draggable = true;
          newPointNoListeners.setAttribute('class','start')
        } else {
          this.finishCell = newPoint;
          this.finishCell.draggable = true;
          newPointNoListeners.setAttribute('class','finish')
        };

        oldPoint.removeAttribute('dragstart');
        oldPoint.draggable = false;
        oldPoint.removeAttribute('class');
        this._initCellLocalEventListener(oldPoint);
        this._initCellStartLocalEventListener(newPointNoListeners);
        this.onPointChanged(event.target.id, oldPointId);
      });

      cell.addEventListener('mouseenter', event => {
        if (event.which==1){
          if (event.shiftKey){
            if (cell.classList.contains('weight')) {
              cell.removeAttribute('class','weight')
              this.onWeightSet(cell.id,false);
            } else if (cell.classList.contains('wall')) {
              this.onWallSet(cell.id,false);
              cell.setAttribute('class','weight');
              this.onWeightSet(cell.id,true);
            } else {
              cell.setAttribute('class','weight');
              this.onWeightSet(cell.id,true);
            }
          } else{
            if (cell.classList.contains('wall')) {
              cell.removeAttribute('class','wall');
              this.onWallSet(cell.id,false);
            } else if (cell.classList.contains('weight')) {
              this.onWeightSet(cell.id,false);
              cell.setAttribute('class','wall');
              this.onWallSet(cell.id,true);
            } else {
              cell.setAttribute('class','wall');
              this.onWallSet(cell.id,true);
            };
          };
        };
      });

      cell.addEventListener('mousedown', event => {
        if (event.which==1){
          if (event.shiftKey){
            if (cell.classList.contains('weight')) {
              cell.removeAttribute('class','weight');
              this.onWeightSet(cell.id,false);
            } else if (cell.classList.contains('wall')) {
              this.onWallSet(cell.id,false);
              cell.setAttribute('class','weight');
              this.onWeightSet(cell.id,true);
            } else {
              cell.setAttribute('class','weight');
              this.onWeightSet(cell.id,true);
            }
          } else{
            if (cell.classList.contains('wall')) {
              cell.removeAttribute('class','wall');
              this.onWallSet(cell.id,false);
            } else if (cell.classList.contains('weight')) {
              this.onWeightSet(cell.id,false);
              cell.setAttribute('class','wall');
              this.onWallSet(cell.id,true);
            } else {
              cell.setAttribute('class','wall');
              this.onWallSet(cell.id,true);
            };
          };
        };
      });
  };

  drawTable(size,start,finish) {
    this.grid.innerHTML = "";
    for (var i = 0; i < size; i++) {
      var row = this.grid.insertRow(i);
      for (var j = 0; j < Math.floor(size * 2); j++) {
        var cell = row.insertCell(j);
        cell.setAttribute('id',i.toString() + ',' + j.toString());
        if (i==start[0] && j==start[1])
          {
            cell.setAttribute('class', 'start');
            this.startCell = cell;
            this.startCell.draggable = true;
            this._initCellStartLocalEventListener(cell);
          }
        else if (i==finish[0] && j==finish[1])
          {
            cell.setAttribute('class','finish');
            cell.draggable = true;
            this.finishCell = cell;
            this._initCellStartLocalEventListener(cell)
          }
        else this._initCellLocalEventListener(cell);
      }

    }
  };

  _clearTable(walls){
    var cells = document.getElementsByTagName('td');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('visited');
      cells[i].classList.remove('onPath');
      if (walls) cells[i].classList.remove('wall');
    }
  };

  drawPath(points, class1, shortestPath, class2) {
    var i = shortestPath ? 1 : 0;
    var shortestPathDrawn = false;
    this._clearTable();

    function s(cells,className,delay) {
      setTimeout( () => {
        var cell = document.getElementById(cells[i][0] + ',' + cells[i][1]);
        cell.classList.add(className);
        i++;
        if (i < cells.length) {
          s(cells,className,delay)
        } else {
          i=1;
          if (!shortestPathDrawn && shortestPath){
            shortestPathDrawn = true;
            s(shortestPath,class2,100);
          }
        }
      },delay)
    }
    s(points,class1,15)


  }

}


function init(){
  var app = new Controller(new View(),new Model());
}


window.onload = init;
