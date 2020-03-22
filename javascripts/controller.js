class Controller{
  constructor(v,m) {
    this.view = v;
    this.model = m;
    this.view.bindRangePicker(this.rangePickerHandler.bind(this));
    this.view.bindVisualizeButton(this.visualizeHandler.bind(this));
    this.view.bindOnPointChanged(this.pointChangedHandler.bind(this));
    this.view.bindOnWallSet(this.wallSetHandler.bind(this));
    this.view.bindOnWeightSet(this.weightSetHandler.bind(this));
    this.view.bindClearPathButton();
    this.view.bindClearBoardButton(this.clearBoardHandler.bind(this));
    this.view.bindRecursiveMazeButton(this.recuresiveMazeHandler.bind(this));
    this.view.bindRandomMazeButton(this.randomMazeHandler.bind(this));
    this.model.bindOnSizeChanged(this.sizeChangedHandler.bind(this));
    this.model.bindOnPathBuilt(this.pathBuiltHandler.bind(this));
    this.model.bindOnMazeBuilt(this.MazeBuiltHandler.bind(this));
    this.sizeChangedHandler(this.model.size, this.model.start, this.model.finish)
  }

  rangePickerHandler(size){
    this.model.changeGrid(size);
  };

  sizeChangedHandler(size, start, finish, pointChangedHandler){
    this.view.drawTable(size, start, finish);
  };

  clearBoardHandler(){
    this.model.changeGrid(this.model.size);
  };

  cellHadler(cell){
    this.model.setPoint(cell);
  };

  pathBuiltHandler(points,shortestPath){
    this.view.drawPath(points,'visited',shortestPath,'onPath');
  };

  visualizeHandler(){
    this.model.visualize(this.view.algoPicker.value);
  };

  pointChangedHandler(newPoint,oldPoint){
    this.model.changePoints(newPoint,oldPoint);
  };

  wallSetHandler(point,set){
    this.model.setWall(point,set);
  };

  weightSetHandler(point,set){
    this.model.setWeight(point,set);
  };

  recuresiveMazeHandler(){
    this.model.buildRecursiveMaze();
  };

  randomMazeHandler(){
    this.model.buildRandomMaze();
  };

  MazeBuiltHandler(points){
    this.view.drawPath(points,'wall');
  };

};
