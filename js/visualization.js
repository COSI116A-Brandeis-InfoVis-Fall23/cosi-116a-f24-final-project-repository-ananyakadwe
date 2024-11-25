// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {
  const fakeData = [ //replace with predition accuracy % / headways data
    {year: "2019", frequency: 0.1},
    {year: "2020", frequency: 0.2},
    {year: "2021", frequency: 0.3},
    {year: "2022", frequency: 0.25},
    {year: "2023", frequency: 0.2},
  ];

  function chart(data){
    const width = 928;
    const height = 500
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 40;

    const x = d3.scaleBand()
      .domain(data.map(d => d.year)) //x-axis figs
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 0.3]) //y-axis figs (frequency of fake data for now)
      .range([height - marginBottom, marginTop])

      const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0,0,width,height])
        .attr("style", "max-width: 100%; height: auto;")
      
      svg.append("g")
          .attr("fill", "pink")
          .selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", d => x(d.year))
          .attr("y", d => y(d.frequency))
          .attr("height", d => y(0) - y(d.frequency))
          .attr("width", x.bandwidth());

      //x-axis
      svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", "14px");
    
      //y-axis
      svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickFormat(y => (y * 100).toFixed()))
        .selectAll("text")
        .style("font-size", "14px")

        //need to add y-axis and x-axis title... repeated ticks, will figure out later
    
      d3.select("#chart-container").append(() => svg.node());
    }
    chart(fakeData);
  
  
  console.log("Hello, world!");

})());