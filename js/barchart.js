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
    // Get the container dimensions dynamically
    const container = document.getElementById("bar-chart-container");
    const width = container.offsetWidth; // Dynamically use the container's width
    const height = container.offsetHeight || 400; // Dynamically use the container's height

    //Added correct margins and dynamic sizing**
    const margin = { top: 30, right: 20, bottom: 70, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    //Scales now use chartWidth and chartHeight correctly**
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.year))
      .range([0, chartWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.average_headway)])
      .range([chartHeight, 0]);

    //Updated SVG and group positioning**
    const svg = d3
      .select("#bar-chart-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    //Ensured bars render correctly within dimensions**
    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.average_headway))
      .attr("width", x.bandwidth())
      .attr("height", (d) => chartHeight - y(d.average_headway))
      .attr("fill", "steelblue");

    //Added properly scaled X-axis**
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    //Added properly scaled Y-axis**
    chart
      .append("g")
      .call(d3.axisLeft(y).ticks(6).tickFormat((d) => `${d.toFixed(0)} sec`))
      .selectAll("text")
      .style("font-size", "12px");

    //Added Y-axis Label**
    svg
      .append("text")
      .attr("x", -chartHeight / 2)
      .attr("y", margin.left / 3)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Average Headway (seconds)")
      .style("font-size", "14px");

    //Added X-axis Label**
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom / 4)
      .attr("text-anchor", "middle")
      .text("Year")
      .style("font-size", "14px");
    }
})());