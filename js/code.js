/*
Author: Olga Torok
Sources: https://www.youtube.com/watch?v=Fjmxh-gnBM0
        https://bl.ocks.org/mbostock/3887051
*/

//-----------------------------------------------------------------
//------------------ Declaring variables --------------------------

var margin= { top: 30, right:30, bottom: 100, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var percent = d3.format(".0%");

//-----------------------------------------------------------------
//--------------------- Creating the svg --------------------------

var svg = d3.select("body")
    .append("svg")
    .attr("width",  width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right +")");


//-----------------------------------------------------------------
//------------------Define x, y and colour scales------------------

    // Sets the x scale from 0 to the width and the edge padding
    // for the big grouping elements, the countries
var xScale = d3.scaleBand().rangeRound([0, width]).paddingInner(.2),
    // Sets the  x scale and padding for the small grouping elements, the causes of death
    x1Scale = d3.scaleBand().padding(0.05),
    // Sets the linear scale for the data - inverse so the bars start from the bottom up
    yScale = d3.scaleLinear().rangeRound([height, 0]),
    // Create an ordinal scale for colours, to be used on the list of causes of death
    zColor = d3.scaleOrdinal().range(["#691e2d", "#a83048", "#db627b"]); // Red
    // zColor = d3.scaleOrdinal().range(["#d83b00", "#9dd800", "#009dd8"]); // Colourful


//-----------------------------------------------------------------
//------------- Importing the data using the csv function ---------

// Th D3 does a synchronous call to the server to get the data and then builds the chart
d3.csv("data.csv", function(d, i, columns){
    // Loop through the data and convert it into integers
    for(var i = 1, n = columns.length; i < n; i++) d[columns[i]] = +d[columns[i]];
    return d;
}, function(error, data){
    // If there is an error then show the error in the console
    if (error) console.log("Error: data not loaded!!!");

    // Create a variable that holds the keys
    // slice() returns an array of the keys from columns[1], the causes of death
    // The keys stored in this variable contain data numbers
    var keys = data.columns.slice(1);


    //-----------------------------------------------------------------
    //-------------- Specify the domain for x, y  scales---------------

    // Sets the domain of x scale as the list of all the countries found in the dataset
    xScale.domain(data.map(function(d){ return d.country; }));
    // Sets the domain of x1 scale as the list of all the causes of death found in the dataset for each country
    // This is how the data stays grouped together
    x1Scale.domain(keys).rangeRound([0, xScale.bandwidth()]);
    // A continuous linear function so that the domain goes from 0 to the max % of causes of death for each countries in the data
    // The first max() function goes through all the data and passes each object to the inner max() function
    // The inner function goes through the array of values found in the keys variable and finds the maximum value and returns it
    yScale.domain([0, d3.max(data, function(d){ return d3.max(keys, function(key) { return d[key]; }); })]).nice(); // Extends the domain to nice round numbers using nice() function



    //-----------------------------------------------------------------
    //------------------------ Drawing the bars------------------------

    // Bind the objects to the SVG group element
    // Each object represents one country and each one will have bound to it its data
    // Each group is transformed and translated based on the xScale for each specific country
    // A rectange is created for each cause of death segment found in each country
    // Use the array of objects with their causes of death names and value found in each country to append rectangles
    // The x and y coordinates are based on the key and value of causes of death
    // The height is based on the height of the inner container minus the value of the causes of death
    // A transition, duration and delay functions were added to create tha animation of the graph
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + xScale(d.country) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter()
        .append("rect")
        .attr("width", x1Scale.bandwidth())
        .transition().duration(2000)    // Specifies the transition duration of the elements groups in milliseconds
        .delay(function(d, i){ return i * 200;})
        .attr("x", function(d) { return x1Scale(d.key); })
        .attr("y", function(d) { return yScale(d.value); })
        .attr("height", function(d) { return height - yScale(d.value); })
        .style("fill", function(d, i){ return zColor(d.key);});


        //-----------------------------------------------------------------
        //------------------------ Drawing the bars------------------------
        // Label the bars - this does not work
        // svg.selectAll("text")
        //     .data(data)
        //     .enter()
        //     .append("text")
        //     .attr("height", function(d) { return height - yScale(d.value); })  // gets the bars at position 0
        //     .attr("y", height)  // y value set to height
        //     .transition().duration(2000)    // adds a tran of 2700 milliseconds
        //     .delay(function(d,i){ return i * 200;})
        //     .attr("x", function(d){ return xScale(d.country) + xScale.bandwidth()/2; })  // Sets the label in the middle of the bar
        //     // .attr("y", function(d){ return yScale(d.key) + 16;})
        //     .style("fill", "white")
        //     .style("text-anchor", "middle")
        //     .style("font-size", "9px")
        //     // .text(function(d){ return d.key; })
        //     .text("hey");




    //-----------------------------------------------------------------
    //-------------------- Adding the x and y axis---------------------

    // SVG group elements are added for the x axis
    // Bottom axis created based on the xScale to show the countries
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-50)")   // Transfort the text by slanting it to -60 degrees
        .attr("dx", "-.8em")    // Moves the countries names (down) -.8em in relation to the x value
        .attr("dy", ".15em")    // Moves the countries names (right) -.15em in relation to the y value
        .style("text-anchor", "end")   // Pulls the labels out from udner the x axis by anchoring the end of the text
        .style("font-size", "11px");

    // SVG group elements are added for the y axis
    // Bottom axis created based on the yScale to show the data for causes of death
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("x", 2)
        .attr("y", yScale(yScale.ticks().pop()) + 0.5)  // give a  specific formatting function
        .attr("transform", "rotate(-90)")
        .attr("dx", "-7em") // Moves the text %Population (down) -7em in relation to the x value
        .attr("dy", "2em")   // Moves the text %Population (right) 2em in relation to the y value
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")   // Anchors the start of the labels on the y axis
        .text("% Population");



    //-----------------------------------------------------------------
    //----------------------- Adding the legend------------------------

    // Svg group elements are added based on the data of the cause of death names
    // Each element is transformed and translated according to the index element so they line up from top to bottom
    var legend = svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // Rectangles are added to the legend
    // Because the domain has already been set, the colours will match with the bar that were constructed
    legend.append("rect")
        .attr("x", width - width/2 + 3)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", zColor);

    // Text is added to the legend of each group element
    // The text of each box is set according to the data bound to each of the legend element
    legend.append("text")
        .attr("x", width - width/2)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });



});
