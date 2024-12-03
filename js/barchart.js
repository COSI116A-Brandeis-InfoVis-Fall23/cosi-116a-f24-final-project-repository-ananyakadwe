// Immediately Invoked Function Expression to limit access to variables
((() => {
  const files = [
    {file: "data/Data/cleaned_by_year/Headways_2016_cleaned.csv", year: 2016},
    {file: "data/Data/cleaned_by_year/Headways_2017_cleaned.csv", year: 2017},
    {file: "data/Data/cleaned_by_year/Headways_2018_cleaned.csv", year: 2018},
    {file: "data/Data/cleaned_by_year/Headways_2019_cleaned.csv", year: 2019},
    {file: "data/Data/cleaned_by_year/Headways_2020_cleaned.csv", year: 2020},
    {file: "data/Data/cleaned_by_year/Headways_2021_cleaned.csv", year: 2021},
    {file: "data/Data/cleaned_by_year/Headways_2022_cleaned.csv", year: 2022},
  ];

  let combinedData = [];

  function loadFiles(index){
    if (index >= files.length){
      processAndRender(combinedData);
      return;
    }
    const { file, year } = files[index];

    d3.csv(file, (data) => {
      data.forEach(d => {
        combinedData.push({
          year: year, // add the year from the file info
          destination: d.destination,
          headway_time_sec: +d.headway_time_sec, //headway to a number
        });
      });

      // load the next file
      loadFiles(index + 1);
    });
  }

  loadFiles(0);

  function processAndRender(data){
    //Aggregate data by year to calculate the average headway
    const aggregatedData = d3.nest()
      .key(d => d.year) //grouped by year
      .rollup(values => d3.mean(values, d => d.headway_time_sec)) //avg headway
      .entries(data)
      .map(d => ({
        year: +d.key, //convert year to number
        average_headway: d.value, //avg headway
      }));
      renderChart(aggregatedData);
  }

  function renderChart(data) {
    const width = 200;
    const height = 150
    const marginTop = 5;
    const marginRight = 1;
    const marginBottom = 20;
    const marginLeft = 60;

    //set the scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.year)) //x-axis figs (YEARS)
      .rangeRound([marginLeft, width - marginRight])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.average_headway)]) //y-axis figs (HEADWAY)
      .rangeRound([height - marginBottom, marginTop]);

     //create the SVG container
     const svg = d3.select("#bar-chart-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    //add bars
    svg.append("g")
      .attr("fill", "red") //CHANGE COLOR FOR EACH STOP LINE
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.year))
      .attr("y", d => y(d.average_headway))
      .attr("height", d => y(0) - y(d.average_headway))
      .attr("width", x.bandwidth());

    //x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`) // Fixed template literal
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    //y-axis
    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`) // Fixed template literal
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d.toFixed(0)} sec`)) // Correct template literal
      //.call(d3.axisLeft(y).tickFormat(y => (y * 100).toFixed()))
      .selectAll("text")
      .style("font-size", "10x");

    //y-axis label
    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", marginLeft / 3)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Average Headway (seconds)")
      .style("font-size", "12px");

    //x-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - marginBottom / 4)
      .attr("text-anchor", "middle")
      .text("Year")
      .style("font-size", "12px");
    }
})());