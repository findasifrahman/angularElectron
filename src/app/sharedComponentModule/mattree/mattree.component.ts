import { Component, OnInit, Input, OnChanges, Output,EventEmitter } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

interface ProductsNode {
  groupname: string;
  productname:string;
  id: number;
  ide:number;
  products?: ProductsNode[];
}
interface mainFlatNode {
  expandable: boolean;
  groupname: string;
  level: number;
}
@Component({
  selector: 'app-mattree',
  templateUrl: './mattree.component.html',
  styleUrls: ['./mattree.component.css']
})
export class MattreeComponent implements OnInit,OnChanges {
  @Input() datasourceval:any;
  @Output() parentClicktemit = new EventEmitter<any>();
  @Output() childClickemit = new EventEmitter<any>();
  activeNode;
  constructor() { }

  groupByList(val){
    console.log(val);
    this.parentClicktemit.emit(val);
  }
  productsclick(val){
    //console.log(val);
    this.childClickemit.emit(val);
    //this.router.navigate(["/productdetail/" + val]);
  }
  ngOnInit() {
  }
  ngOnChanges(){
    this.dataSource.data = this.datasourceval;
    console.log(this.datasourceval);
  }
  /*private transformer = (node: ProductsNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length >= 0,
      name: node.name,
      id:node.id,
      ide:node.ide,
      level: level,
    };
  }*/
  private transformer = function(node: ProductsNode, level: number){
    return {
      expandable: !!node.products && node.products.length >= 0,
      groupname: node.groupname,
      productname: node.productname,
      id:node.id,
      ide:node.ide,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<mainFlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this.transformer,node => node.level, node => node.expandable, node => node.products);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: mainFlatNode) => node.expandable;
}
