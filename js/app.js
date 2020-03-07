/*
This file is distributed under MIT license.
*/
(function() {
  Number.prototype.toPersian = function() {
    if (!this.valueOf()) {
      return 'صفر';
    } else {
      if (this.valueOf() < 0) {
        return 'N/A';
      } else {
        return this.toLocaleString('fa-IR');
      }
    }
  };
  let provinces = {
    20: 'اصفهان',
    24: 'کرمان',
    27: 'یزد',
    23: 'فارس',
    14: 'هرمزگان',
    13: 'بوشهر',
    12: 'سیستان و بلوچستان',
    11: 'خراسان جنوبی',
    10: 'خراسان رضوی',
    8: 'خراسان شمالی',
    9: 'گلستان',
    15: 'مازندران',
    3: 'گیلان',
    2: 'اردبیل',
    1: 'آذربایجان شرقی',
    0: 'آذربایجان غربی',
    16: 'سمنان',
    29: 'تهران',
    28: 'قم',
    30: 'البرز',
    18: 'قزوین',
    17: 'زنجان',
    4: 'کردستان',
    5: 'کرمانشاه',
    7: 'خوزستان',
    6: 'ایلام',
    26: 'لرستان',
    25: 'همدان',
    19: 'مرکزی',
    22: 'کهکیلویه و بویراحمد',
    21: 'چهارمحال و بختیاری',
  };

  window.currentProvince = null;
  window.virusData = null;

  window.reRender = () => {
    if (!virusData || !currentProvince) {
      return;
    }

    const data = virusData.provinces[currentProvince];
    document.getElementById('provinceSection').style = '';
    document.getElementById('provinceName').innerText =
      provinces[currentProvince];

    document.getElementById(
      'pTotalCases',
    ).innerHTML = data.total_cases.toPersian();
    document.getElementById('pNewCases').innerHTML = data.new_cases.toPersian();
    document.getElementById(
      'pTotalFatalities',
    ).innerHTML = data.total_fatalities.toPersian();
    document.getElementById(
      'pNewFatalities',
    ).innerHTML = data.new_fatalities.toPersian();
    document.getElementById(
      'pTotalRecoveries',
    ).innerHTML = data.total_recoveries.toPersian();
    document.getElementById(
      'pNewRecoveries',
    ).innerHTML = data.new_cases.toPersian();
  };

  var svg = d3
    .select('#mapContainer')
    .append('svg')
    .attr('width', '100%')
    .attr('height', 500);

  var projection = d3.geo
    .albers()
    .center([4.5, 33])
    .rotate([-50, 0.1])
    // .parallels([-10, -10])
    .scale(Math.min(1500, window.innerWidth * 3))
    .translate([
      svg.node().getBoundingClientRect().width / 2,
      svg.node().getBoundingClientRect().height / 2,
    ]);

  var path = d3.geo.path().projection(projection);

  d3.json('iran.json', function(error, iran) {
    if (error) {
      console.error(error);
      return;
    }
    d3.json('data.json', function(error, data) {
      if (error) {
        console.error(error);
        return;
      }
      virusData = data;

      document.getElementById('source').innerHTML = data.source;
      document.getElementById('lastUpdated').innerHTML = data.lastUpdated;
      document.getElementById(
        'totalCases',
      ).innerHTML = data.total_cases.toPersian();
      document.getElementById(
        'newCases',
      ).innerHTML = data.new_cases.toPersian();
      document.getElementById(
        'totalFatalities',
      ).innerHTML = data.total_fatalities.toPersian();
      document.getElementById(
        'newFatalities',
      ).innerHTML = data.new_fatalities.toPersian();
      document.getElementById(
        'totalRecoveries',
      ).innerHTML = data.total_recoveries.toPersian();
      document.getElementById(
        'newRecoveries',
      ).innerHTML = data.new_recoveries.toPersian();
      document.getElementById('treatmentAge').innerHTML =
        data.treatmentAge || 'N/A';
      document.getElementById('deathAge').innerHTML = data.deathAge || 'N/A';

      var subunits = topojson.feature(iran, iran.objects.subunits);
      svg
        .selectAll('.subunit')
        .data(subunits.features)
        .enter()
        .append('path')
        .attr('class', function(d, i) {
          let className = '';
          if (data.provinces[i]) {
            const totalCases = data.provinces[i].total_cases;
            if (totalCases > 1) {
              className = 'low';
            }
            if (totalCases > 100) {
              className = 'medium';
            }
            if (totalCases > 500) {
              className = 'high';
            }
            if (totalCases > 1000) {
              className = 'critical';
            }
          }
          return `subunit ${className ? `status-${className}` : ''}`;
        })
        .attr('d', path)
        .attr('data-id', (d, i) => i)
        .attr('onmouseover', 'currentProvince = this.dataset.id;reRender()');

      svg
        .selectAll('.subunit-label')
        .data(subunits.features)
        .enter()
        .append('text')
        .attr('class', d => 'subunit-label ' + d.id)
        .attr('transform', d => `translate(${path.centroid(d)})`)
        .attr(
          'style',
          d => `font-size: ${Math.min(20, path.area(d) * 0.015)}px`,
        )
        .attr('dy', (d, i) => (i === 14 ? '-.45em' : '.35em'))
        .attr('dx', '-.25em')
        .attr('data-id', (d, i) => i)
        .attr('onmouseover', 'currentProvince = this.dataset.id;reRender()')
        .text((d, i) => {
          const totalCases = data.provinces[i].total_cases;
          if (totalCases) {
            return totalCases.toLocaleString('fa-IR');
          } else {
            return '';
          }
        });
    });
  });
})();
