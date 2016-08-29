function drawBall(svg, countballs, d_id, d_title, d_src) {
    var R = 600; //圖像區域大小
    var duration = 1000; //動畫持續時間
    var index = 0; //節點編號
    var img_w = 60;
    var img_h = 60;
    var deletenode = 0;
    var pop = 0;
    var link2node = 0;
    var relation = {
        "relnodes": [],
        "links": [{
            "source": 0,
            "target": 1,
            "name": "A-B"
        }]
    };
    //relation=[];
    //定義一個Tree對象,定義旋轉角度和最大半徑
    var tree = d3.layout.tree()
        .size([360, R / 2 - 80])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 5) / a.depth;
        });
    //定義佈局方向
    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) {
            return [d.y, d.x / 180 * Math.PI];
        });
    var tree2 = d3.layout.tree()
        .size([360, R / 2 - 120])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 20) / a.depth;
        });
    //定義佈局方向
    var diagonal2 = d3.svg.diagonal.radial()
        .projection(function(d) {
            return [d.y - 50, d.x / 180 * Math.PI];
        });



    //新建畫布，移動到圓心位置
    /*var svg = d3.select("body").append("svg")
        .attr("width", R)
        .attr("height", R)
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + R / 2 + "," + R / 2 + ")";
        });*/

    start();

    //根據JSON數據生成樹
    function start() {
        if (countballs == 1) {
            root.children = [];
        }
        child = {
            "id": (100 * countballs).toString(),
            "dataid": d_id,
            "name": d_title + (100 * countballs).toString(),
            "children": [{
                "id": (100 * countballs + 1).toString(),
                "name": "",
                "mark": "comp",
                "image": "comp.png",
                "children": "",
                "visible": 0
            }, {
                "id": (100 * countballs + 2).toString(),
                "name": "",
                "mark": "pre",
                "image": "pre.png",
                "children": "",
                "visible": 0
            }, {
                "id": (100 * countballs + 3).toString(),
                "name": "",
                "mark": "post",
                "image": "post.png",
                "children": "",
                "visible": 0
            }],
            "image": d_src,
            "visible": 0
        };
        root.children.push(child);

        console.log(root);
        root.children.forEach(collapse);
        var nodes = tree.nodes(root); //根據數據生成nodes集合    
        nodes.forEach(function(d) { //記錄現在的位置
            d.x0 = d.x;
            d.y0 = d.y;
        });

        var links = tree.links(nodes); //獲取node集合的關係集合  
        var node = svg.selectAll(".node") //根據node集合生成節點,添加id是為了區分是否冗餘的節點
            .data(nodes, function(d) {
                if (d.visible == 0) {
                    return d.id || (d.id = ++index);
                }
            });
        //為關係集合設置貝塞爾曲線連接
        var link = svg.selectAll(".link")
            .data(links, function(d) {
                return d.target.id;
            })
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        node.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })
            .on("click", nodeClick);
        //以圖片做節點	
        node.append("image")
            .attr("width", img_w)
            .attr("height", img_h)
            .attr("xlink:href", function(d) {
                return d.image;
            })

        //為節點添加說明文字
        node.append("text")
            .attr("dy", ".4em")
            .text(function(d) {
                return d.level;
            })
            .on("mouseover", function() {
                allButtons.style("fill-opacity", 1.0);
            })
            .on("mouseout", function() {
                allButtons.style("fill-opacity", 0.0)

            })
            .attr("text-anchor", function(d) {
                return d.x < 180 ? "start" : "end";
            })
            .attr("transform", function(d) {
                return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
            });
        //fontawesome button labels
        var labels = ['\uf00d', '\uf0c9', '\uf066'];

        //colors for different button states 
        var defaultColor = "#28AFB0"
        var hoverColor = "#1977F6"
        var pressedColor = "#09406C"

        //container for all buttons
        var allButtons = node
            .append("g")
            .attr("id", "allButtons")
            .on("mouseover", function() {
                allButtons.style("fill-opacity", 1.0);
            })
            .on("mouseout", function() {
                allButtons.style("fill-opacity", 0.0)

            })
            //groups for each button (which will hold a rect and text)
        var buttonGroups = allButtons.selectAll("g.button")
            .data(function(d) {
                if (d.name != "") return d;
            })
            .data(labels)
            .enter()
            .append("g")
            .attr("class", "button")
            .style("cursor", "pointer")
            .on("click", function(d, i, event) {
                updateButtonColors(d3.select(this), d3.select(this.parentNode))
                if (i == 0) //delete
                {
                    deletenode = 1;
                } else if (i == 1) //pop
                {
                    pop = 1;
                } else if (i == 2) //link
                {
                    link2node++;
                }
            })
            .on("mouseover", function() {
                if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this)
                        .select("rect")
                        .attr("fill", hoverColor);
                }
            })
            .on("mouseout", function() {
                if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this)
                        .select("rect")
                        .attr("fill", defaultColor);
                }
            })

        var bWidth = 25; //button width
        var bHeight = 22; //button height
        var bSpace = 1; //space between buttons
        var x0 = 60; //x offset
        var y0 = -5; //y offset
        //adding a rect to each toggle button group
        //rx and ry give the rect rounded corner
        buttonGroups.append("rect")
            .attr("class", "buttonRect")
            .attr("width", bWidth)
            .attr("height", bHeight)
            .attr("x", x0)
            .attr("y", function(d, i) {
                return y0 + (bHeight + bSpace) * i;
            })
            .attr("rx", 5) //rx and ry give the buttons rounded corners
            .attr("ry", 5)
            .attr("fill", defaultColor)

        //adding text to each toggle button group, centered 
        //within the toggle button rect
        buttonGroups.append("text")
            .attr("class", "buttonText")
            .attr("font-family", "FontAwesome")
            .attr("y", function(d, i) {
                return y0 + (bHeight + bSpace) * i + bHeight / 2;
            })
            .attr("x", x0 + bWidth / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "white")
            .text(function(d) {
                return d;
            })

        function updateButtonColors(button, parent) {
            parent.selectAll("rect")
                .attr("fill", defaultColor)

            button.select("rect")
                .attr("fill", pressedColor)
        }
        //點擊的話，隱藏或者顯示子節點
        function nodeClick(d) {
            if (deletenode == 1) {
                //delete root.d.id;
                console.log(d);
                d["visible"] = 1;
                deletenode = 0;
                console.log("delete");
                console.log(deletenode);
                update(d);
                console.log(root);
                d3.event.stopPropagation();
                return;
            } else if (pop == 1) {
                popWindow(d_id);
                pop = 0;
                console.log("pop");
                console.log(pop);
                return;
            } else if (link2node != 0) {
                if (link2node == 1) {
                    relation.relnodes = [];
                    console.log("link2node");
                    console.log(link2node);
                    console.log(d);
                    relation.relnodes.push(d);
                    console.log(relation);
                    return;
                } else if (link2node == 2) {
                    console.log("link2node");
                    console.log(link2node);
                    console.log(d);
                    relation.relnodes.push(d);
                    console.log(relation);
                    var relnodes = tree2.nodes(relation).reverse();
                    var rellinks = tree2.links(relnodes);
                    //為鏈接更新數據
                    var rellink = svg.selectAll("path.link").data(rellinks, function(d) {
                        return d.target.id;
                    });
                    //更新鏈接
                    rellink.enter()
                        .append("path")
                        .attr("class", "link2")
                        .attr("d", function(d) {
                            var o = {
                                x: source.x,
                                y: source.y
                            };
                            return diagonal2({
                                source: o,
                                target: o
                            });
                        })
                        .append("text")
                        .attr("class", "linetext")
                        .text(function(d) {
                            return 0.8;
                        });

                    rellink.transition()
                        .duration(duration)
                        .attr("d", diagonal2);
                    link2node = 0;
                    console.log("畫好囉");
                    return;
                }
            }
            if (d3.event.defaultPrevented) return; // ignore drag
            else if (d.children) {
                d._children = d.children;
                d.children = null;
                /*console.log(root);
                //update(d);
                console.log("收"); //這裡是收*/
                update(d);
                //d.children = d._children;

            } else {
                d.children = d._children;
                d._children = null;
                if (d.mark == 'comp') getcomp(d);
                else if (d.mark == 'pre') getpre(d);
                else if (d.mark == 'post') getpost(d);
                else if (d.children == null) getthree(d);
                /* console.log(root);
                 console.log("發散");
                 console.log("這裡還在嗎?"); //這裡是收
                 console.log(root);*/
                update(d);
                //d._children = d.children;
            }

            // update(d);
        }

        //更新顯示
        function update(source) {
            //取得現有的節點數據,因為設置了Children屬性，沒有Children的節點將被刪除
            var nodes = tree.nodes(root).reverse();
            var links = tree.links(nodes);
            //為節點更新數據
            var node = svg.selectAll("g.node")
                .data(nodes, function(d) {
                    if (d.visible == 0)
                        return d.id || (d.id = ++index);
                });
            //console.log(node);
            //為鏈接更新數據
            var link = svg.selectAll("path.link").data(links, function(d) {
                return d.target.id;
            });
            //更新鏈接
            link.enter()
                .append("path")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                });

            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            link.exit() //移除無用的鏈接
                .transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            //更新節點集合
            var nodeEnter = node.enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    if (d.visible == 0)
                        return "rotate(" + (source.x0 - 90) + ")translate(" + source.y0 + ")";
                })
                .on("click", nodeClick);

            node.append("image")
                .attr("width", img_w)
                .attr("height", img_h)
                .attr("xlink:href", function(d) {
                    if (d.visible == 0)
                        return d.image;
                })
                //為節點添加說明文字
            node.append("text")
                .attr("dy", ".5em")
                .attr("class", "text2")
                .text(function(d) {
                    if (d.visible == 0)
                        return d.name;
                })
                .on("mouseover", function() {
                    allButtons.style("fill-opacity", 1.0);
                })
                .on("mouseout", function() {
                    allButtons.style("fill-opacity", 0.0)

                });

            //節點動畫
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                });
            // console.log("這邊呢?");//這裡是收
            //  console.log(root);

            //將無用的子節點刪除
            var nodeExit = node.exit()
                .transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "rotate(" + (source.x - 90) + ")translate(" + source.y + ")";
                })
                .remove();


            //console.log("這裡呢?");//這裡是收
            //  console.log(root);
            //fontawesome button labels
            var labels = ['\uf00d', '\uf0c9', '\uf066'];

            //colors for different button states 
            var defaultColor = "#28AFB0"
            var hoverColor = "#1977F6"
            var pressedColor = "#09406C"

            //container for all buttons
            var allButtons = nodeEnter
                .append("g")
                .attr("id", "allButtons")
                .on("mouseover", function() {
                    allButtons.style("fill-opacity", 1.0);
                })
                .on("mouseout", function() {
                    allButtons.style("fill-opacity", 0.0)

                })
                //groups for each button (which will hold a rect and text)
            var buttonGroups = allButtons.selectAll("g.button")
                .data(function(d) {
                    if (d.name != "" && d.name != "root") return d;
                })
                .data(labels)
                .enter()
                .append("g")
                .attr("class", "button")
                .style("cursor", "pointer")
                .on("click", function(d, i, event) {
                    updateButtonColors(d3.select(this), d3.select(this.parentNode))
                    if (i == 0) //delete
                    {
                        deletenode = 1;
                    } else if (i == 1) //pop
                    {
                        pop = 1;
                    } else if (i == 2) //link
                    {
                        link2node++;
                    }
                })
                .on("mouseover", function() {
                    if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                        d3.select(this)
                            .select("rect")
                            .attr("fill", hoverColor);
                    }
                })
                .on("mouseout", function() {
                    if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                        d3.select(this)
                            .select("rect")
                            .attr("fill", defaultColor);
                    }
                })

            //adding a rect to each toggle button group
            //rx and ry give the rect rounded corner
            buttonGroups.append("rect")
                .attr("class", "buttonRect")
                .attr("width", bWidth)
                .attr("height", bHeight)
                .attr("x", x0)
                .attr("y", function(d, i) {
                    return y0 + (bHeight + bSpace) * i;
                })
                .attr("rx", 5) //rx and ry give the buttons rounded corners
                .attr("ry", 5)
                .attr("fill", defaultColor)

            //adding text to each toggle button group, centered 
            //within the toggle button rect
            buttonGroups.append("text")
                .attr("class", "buttonText")
                .attr("font-family", "FontAwesome")
                .attr("y", function(d, i) {
                    return y0 + (bHeight + bSpace) * i + bHeight / 2;
                })
                .attr("x", x0 + bWidth / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .attr("fill", "white")
                .text(function(d) {
                    return d;
                })

            function updateButtonColors(button, parent) {
                parent.selectAll("rect")
                    .attr("fill", defaultColor)

                button.select("rect")
                    .attr("fill", pressedColor)
            }

            //記錄下當前位置,為下次動畫記錄初始值
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            //update(d);

        }

        function getcomp(d) {
            var site = "http://140.121.197.135:7778/servrel/apis/competitive?id=" + d.parent.dataid;
            console.log(d);
            console.log(d.parent.dataid);
            //root.children[0].children = [];
            d.children = [];
            $.getJSON(site, function(result) {
                console.log(result);
                console.log(d);
                console.log(d.children);
                $.each(result, function(index, value) {
                    console.log(value);
                    if (!d.children) d.children = [];
                    if (!d.children.children) d.children.children = [];
                    value["image"] = value.pic;
                    value["dataid"] = value.id;
                    value["visible"] = 0;
                    value["id"] = Math.floor(Math.random() * 100000);
                    console.log(value);
                    // d.children[index]=[];
                    d.children.push(value);
                });
                console.log(root);
                update(root);

            });
        }

        function getpre(d) {
            var site = "http://140.121.197.135:7778/servrel/apis/cooperative/pre?id=" + d.parent.dataid;
            d.children = [];
            $.getJSON(site, function(result) {
                console.log(result);
                console.log(d);
                $.each(result, function(index, value) {
                    console.log(value);
                    if (!d.children) d.children = [];
                    value["image"] = value.pic;
                    value["dataid"] = value.id;
                    value["visible"] = 0;
                    value["id"] = Math.floor(Math.random() * 100000);
                    console.log(value);
                    // d.children[index]=[];
                    d.children.push(value);

                });
                update(root);
            });
        }

        function getpost(d) {
            var site = "http://140.121.197.135:7778/servrel/apis/cooperative/post?id=" + d.parent.dataid;
            d.children = [];
            $.getJSON(site, function(result) {
                console.log(result);
                console.log(d);
                $.each(result, function(index, value) {
                    console.log(value);
                    if (!d.children) d.children = [];
                    // if (d.children) {
                    value["image"] = value.pic;
                    value["dataid"] = value.id;
                    value["visible"] = 0;
                    value["id"] = Math.floor(Math.random() * 100000);
                    console.log(value);
                    // d.children[index]=[];
                    d.children.push(value);
                    //}
                });
                update(root);
            });
        }

        function getthree(d) {
            if (!d.children) d.children = [];
            child1 = {
                "id": Math.floor(Math.random() * 100000),
                "name": "",
                "mark": "comp",
                "image": "comp.png",
                "children": "",
                "visible": 0
            };
            child2 = {
                "id": Math.floor(Math.random() * 100000),
                "name": "",
                "mark": "pre",
                "image": "pre.png",
                "children": "",
                "visible": 0
            };
            child3 = {
                "id": Math.floor(Math.random() * 100000),
                "name": "",
                "mark": "post",
                "image": "post.png",
                "children": "",
                "visible": 0
            };
            console.log(d);
            d.children.push(child1);
            d.children.push(child2);
            d.children.push(child3);
            console.log(d.children);
            console.log(root);
            update(root);
        }

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }
    }

}