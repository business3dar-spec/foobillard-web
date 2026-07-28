
  var Module = typeof Module !== 'undefined' ? Module : {};

  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }

  Module.expectedDataFileDownloads++;
  (function() {
    // When running as a pthread, FS operations are proxied to the main thread, so we don't need to
    // fetch the .data bundle on the worker
    if (Module['ENVIRONMENT_IS_PTHREAD']) return;
    var loadPackage = function(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/home/claude/work/build_chunked2/chunk1.data';
      var REMOTE_PACKAGE_BASE = 'chunk1.data';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;

      var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];
      var PACKAGE_UUID = metadata['package_uuid'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        if (typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string') {
          require('fs').readFile(packageName, function(err, contents) {
            if (err) {
              errback(err);
            } else {
              callback(contents.buffer);
            }
          });
          return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
          if (event.loaded) {
            if (!xhr.addedTotal) {
              xhr.addedTotal = true;
              if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
              Module.dataFileDownloads[url] = {
                loaded: event.loaded,
                total: size
              };
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
          } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      };

      function handleError(error) {
        console.error('package error:', error);
      };

      var fetchedCallback = null;
      var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

      if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);

    function runWithFS() {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
Module['FS_createPath']("/", "locale", true, true);
Module['FS_createPath']("/locale", "img", true, true);
Module['FS_createPath']("/", "html", true, true);
Module['FS_createPath']("/html", "images", true, true);
Module['FS_createPath']("/locale", "en-uk", true, true);
Module['FS_createPath']("/locale", "en-us", true, true);
Module['FS_createPath']("/locale", "ru", true, true);
Module['FS_createPath']("/locale", "de", true, true);
Module['FS_createPath']("/locale", "es", true, true);
Module['FS_createPath']("/", "music", true, true);
Module['FS_createPath']("/locale", "css", true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency']('fp ' + this.name);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency']('fp ' + that.name);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_/home/claude/work/build_chunked2/chunk1.data');

      };
      Module['addRunDependency']('datafile_/home/claude/work/build_chunked2/chunk1.data');

      if (!Module.preloadResults) Module.preloadResults = {};

      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }

    }
    if (Module['calledRun']) {
      runWithFS();
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/locale/img/birdview.png", "start": 0, "end": 802929}, {"filename": "/LinBiolinum_aS.ttf", "start": 802929, "end": 1563129}, {"filename": "/LinBiolinum_aSB.ttf", "start": 1563129, "end": 2315133}, {"filename": "/locale/img/menue2.png", "start": 2315133, "end": 3039797}, {"filename": "/locale/img/start_a.png", "start": 3039797, "end": 3747624}, {"filename": "/corr1.png", "start": 3747624, "end": 4375116}, {"filename": "/DejaVuSans.ttf", "start": 4375116, "end": 4997136}, {"filename": "/DejaVuSans-Bold.ttf", "start": 4997136, "end": 5570044}, {"filename": "/corr2.png", "start": 5570044, "end": 6134418}, {"filename": "/price.png", "start": 6134418, "end": 6638608}, {"filename": "/ceiling.png", "start": 6638608, "end": 7139578}, {"filename": "/corr3.png", "start": 7139578, "end": 7585937}, {"filename": "/locale/img/snipping.png", "start": 7585937, "end": 8025560}, {"filename": "/carpet.png", "start": 8025560, "end": 8464208}, {"filename": "/locale/img/jumpshots.png", "start": 8464208, "end": 8879637}, {"filename": "/shuffleballs.wav", "start": 8879637, "end": 9283713, "audio": 1}, {"filename": "/window-big1.png", "start": 9283713, "end": 9656499}, {"filename": "/ballinhole.wav", "start": 9656499, "end": 10021847, "audio": 1}, {"filename": "/closewindow.png", "start": 10021847, "end": 10383202}, {"filename": "/ooh.wav", "start": 10383202, "end": 10737950, "audio": 1}, {"filename": "/logo-blank.png", "start": 10737950, "end": 11068246}, {"filename": "/locale/img/snooker.png", "start": 11068246, "end": 11366522}, {"filename": "/locale/img/9ball_a.png", "start": 11366522, "end": 11662408}, {"filename": "/intro.png", "start": 11662408, "end": 11949706}, {"filename": "/locale/img/start.png", "start": 11949706, "end": 12234079}, {"filename": "/queue.png", "start": 12234079, "end": 12511413}, {"filename": "/bomb.wav", "start": 12511413, "end": 12788145, "audio": 1}, {"filename": "/balloutoftable.wav", "start": 12788145, "end": 13055557, "audio": 1}, {"filename": "/locale/img/8ball.png", "start": 13055557, "end": 13312652}, {"filename": "/cabinet-back.png", "start": 13312652, "end": 13553934}, {"filename": "/locale/img/menue-haupt.png", "start": 13553934, "end": 13794042}, {"filename": "/door.png", "start": 13794042, "end": 14005658}, {"filename": "/cabinet-front.png", "start": 14005658, "end": 14217019}, {"filename": "/locale/img/karambol.png", "start": 14217019, "end": 14400009}, {"filename": "/locale/img/9ball.png", "start": 14400009, "end": 14581032}, {"filename": "/smack.wav", "start": 14581032, "end": 14760900, "audio": 1}, {"filename": "/oneballontable.wav", "start": 14760900, "end": 14938476, "audio": 1}, {"filename": "/graffity2.png", "start": 14938476, "end": 15114864}, {"filename": "/queue3.png", "start": 15114864, "end": 15277480}, {"filename": "/html/images/feature.jpg", "start": 15277480, "end": 15436607}, {"filename": "/graffity1.png", "start": 15436607, "end": 15575779}, {"filename": "/board.png", "start": 15575779, "end": 15706377}, {"filename": "/queue2.png", "start": 15706377, "end": 15829596}, {"filename": "/negz.png", "start": 15829596, "end": 15947128}, {"filename": "/negy.png", "start": 15947128, "end": 16053895}, {"filename": "/foobillardplus.ico", "start": 16053895, "end": 16156029}, {"filename": "/fire2.png", "start": 16156029, "end": 16257463}, {"filename": "/locale/en-uk/index_a.html", "start": 16257463, "end": 16357061}, {"filename": "/locale/en-us/index_a.html", "start": 16357061, "end": 16456657}, {"filename": "/locale/ru/index_a.html", "start": 16456657, "end": 16555465}, {"filename": "/fire3.png", "start": 16555465, "end": 16654076}, {"filename": "/fire6.png", "start": 16654076, "end": 16752114}, {"filename": "/locale/de/index_a.html", "start": 16752114, "end": 16849696}, {"filename": "/locale/en-us/index.html", "start": 16849696, "end": 16947214}, {"filename": "/fire4.png", "start": 16947214, "end": 17044041}, {"filename": "/locale/ru/index.html", "start": 17044041, "end": 17140828}, {"filename": "/locale/de/index.html", "start": 17140828, "end": 17234534}, {"filename": "/cloth-col.png", "start": 17234534, "end": 17326305}, {"filename": "/fire7.png", "start": 17326305, "end": 17417495}, {"filename": "/fire9.png", "start": 17417495, "end": 17506768}, {"filename": "/fire8.png", "start": 17506768, "end": 17595924}, {"filename": "/negx.png", "start": 17595924, "end": 17684833}, {"filename": "/fire11.png", "start": 17684833, "end": 17772130}, {"filename": "/shadow3.png", "start": 17772130, "end": 17858753}, {"filename": "/fire1.png", "start": 17858753, "end": 17945038}, {"filename": "/fire10.png", "start": 17945038, "end": 18030821}, {"filename": "/fire12.png", "start": 18030821, "end": 18116187}, {"filename": "/fire13.png", "start": 18116187, "end": 18198814}, {"filename": "/fire0.png", "start": 18198814, "end": 18281439}, {"filename": "/posx.png", "start": 18281439, "end": 18359892}, {"filename": "/table-frame.png", "start": 18359892, "end": 18429095}, {"filename": "/posy.png", "start": 18429095, "end": 18496535}, {"filename": "/bumpref.png", "start": 18496535, "end": 18556782}, {"filename": "/mright-wetab.png", "start": 18556782, "end": 18611266}, {"filename": "/art.png", "start": 18611266, "end": 18662606}, {"filename": "/mright.png", "start": 18662606, "end": 18707734}, {"filename": "/english.png", "start": 18707734, "end": 18748840}, {"filename": "/posz.png", "start": 18748840, "end": 18784393}, {"filename": "/locale/img/steuerkreuz.png", "start": 18784393, "end": 18819203}, {"filename": "/html/tournament.xsl", "start": 18819203, "end": 18853696}, {"filename": "/cabinet-frame.png", "start": 18853696, "end": 18886972}, {"filename": "/foobillardplus.png", "start": 18886972, "end": 18919010}, {"filename": "/sphere_map_128x128.png", "start": 18919010, "end": 18950107}, {"filename": "/sphere_ball.png", "start": 18950107, "end": 18975926}, {"filename": "/volume.png", "start": 18975926, "end": 18999461}, {"filename": "/locale/img/volume.png", "start": 18999461, "end": 19022996}, {"filename": "/place_cue_ball.png", "start": 19022996, "end": 19044698}, {"filename": "/locale/es/index_a.html", "start": 19044698, "end": 19064979}, {"filename": "/locale/ru/wetab-foobillard.txt", "start": 19064979, "end": 19084988}, {"filename": "/locale/ru/foobillard.txt", "start": 19084988, "end": 19104643}, {"filename": "/locale/es/index.html", "start": 19104643, "end": 19124279}, {"filename": "/locale/img/gpl.txt", "start": 19124279, "end": 19142600}, {"filename": "/mleft.png", "start": 19142600, "end": 19159983}, {"filename": "/ball_ball.raw", "start": 19159983, "end": 19176491}, {"filename": "/html/images/logo.jpg", "start": 19176491, "end": 19192411}, {"filename": "/mleftnormal.png", "start": 19192411, "end": 19208330}, {"filename": "/locale/es/wetab-foobillard.txt", "start": 19208330, "end": 19223501}, {"filename": "/locale/es/foobillard.txt", "start": 19223501, "end": 19238463}, {"filename": "/locale/de/foobillard.txt", "start": 19238463, "end": 19252387}, {"filename": "/locale/de/wetab-foobillard.txt", "start": 19252387, "end": 19266240}, {"filename": "/tabletex_wetab_256x256.png", "start": 19266240, "end": 19279612}, {"filename": "/locale/en-us/wetab-foobillard.txt", "start": 19279612, "end": 19291943}, {"filename": "/locale/en-us/foobillard.txt", "start": 19291943, "end": 19304128}, {"filename": "/locale/en-uk/foobillard.txt", "start": 19304128, "end": 19316308}, {"filename": "/locale/img/schuss.png", "start": 19316308, "end": 19327680}, {"filename": "/f.png", "start": 19327680, "end": 19338218}, {"filename": "/locale/img/shot.png", "start": 19338218, "end": 19348743}, {"filename": "/kreuz.png", "start": 19348743, "end": 19359066}, {"filename": "/shot.png", "start": 19359066, "end": 19369263}, {"filename": "/s.png", "start": 19369263, "end": 19379455}, {"filename": "/m.png", "start": 19379455, "end": 19389571}, {"filename": "/e.png", "start": 19389571, "end": 19399594}, {"filename": "/stone-frame.png", "start": 19399594, "end": 19409481}, {"filename": "/b1.png", "start": 19409481, "end": 19418953}, {"filename": "/fov.png", "start": 19418953, "end": 19428086}, {"filename": "/disc.png", "start": 19428086, "end": 19437174}, {"filename": "/firemesh.png", "start": 19437174, "end": 19445811}, {"filename": "/html/history.xsl", "start": 19445811, "end": 19453764}, {"filename": "/locale/img/voll.png", "start": 19453764, "end": 19460996}, {"filename": "/html/styles.css", "start": 19460996, "end": 19467932}, {"filename": "/locale/img/n.png", "start": 19467932, "end": 19474759}, {"filename": "/locale/img/b1.png", "start": 19474759, "end": 19481524}, {"filename": "/locale/img/weiss.png", "start": 19481524, "end": 19488180}, {"filename": "/sofa.png", "start": 19488180, "end": 19494829}, {"filename": "/fp.png", "start": 19494829, "end": 19501478}, {"filename": "/lightflare.png", "start": 19501478, "end": 19507916}, {"filename": "/locale/img/network.png", "start": 19507916, "end": 19514346}, {"filename": "/full_symbol.png", "start": 19514346, "end": 19520620}, {"filename": "/fullhalf_symbol.png", "start": 19520620, "end": 19526729}, {"filename": "/n.png", "start": 19526729, "end": 19532819}, {"filename": "/b.png", "start": 19532819, "end": 19538827}, {"filename": "/locale/img/halb.png", "start": 19538827, "end": 19544572}, {"filename": "/network.png", "start": 19544572, "end": 19549980}, {"filename": "/locale/img/down.png", "start": 19549980, "end": 19555290}, {"filename": "/locale/img/up.png", "start": 19555290, "end": 19560553}, {"filename": "/tabletex_wetab_128x128.png", "start": 19560553, "end": 19565232}, {"filename": "/icon.bmp", "start": 19565232, "end": 19569382}, {"filename": "/foobillardplus.xbm", "start": 19569382, "end": 19573096}, {"filename": "/locale/img/m1.png", "start": 19573096, "end": 19576750}, {"filename": "/locale/img/s1.png", "start": 19576750, "end": 19580369}, {"filename": "/locale/img/symbol-f.png", "start": 19580369, "end": 19583811}, {"filename": "/tabletex_fB_256x256.png", "start": 19583811, "end": 19587114}, {"filename": "/cloth.png", "start": 19587114, "end": 19590410}, {"filename": "/half_symbol.png", "start": 19590410, "end": 19593656}, {"filename": "/up.png", "start": 19593656, "end": 19596885}, {"filename": "/down.png", "start": 19596885, "end": 19600045}, {"filename": "/html/images/gradient-shadow.png", "start": 19600045, "end": 19603039}, {"filename": "/locale/img/esc.png", "start": 19603039, "end": 19606028}, {"filename": "/locale/img/fov.png", "start": 19606028, "end": 19608817}, {"filename": "/locale/img/e1.png", "start": 19608817, "end": 19611514}, {"filename": "/html/images/header-bg.jpg", "start": 19611514, "end": 19614172}, {"filename": "/screenshot.png", "start": 19614172, "end": 19616353}, {"filename": "/locale/img/screenshot.png", "start": 19616353, "end": 19618534}, {"filename": "/locale/img/document-save.png", "start": 19618534, "end": 19620656}, {"filename": "/start.png", "start": 19620656, "end": 19622770}, {"filename": "/pause.png", "start": 19622770, "end": 19624825}, {"filename": "/shadow2.png", "start": 19624825, "end": 19626863}, {"filename": "/cancel.png", "start": 19626863, "end": 19628783}, {"filename": "/locale/img/pgdown.png", "start": 19628783, "end": 19630653}, {"filename": "/locale/img/eingabe.png", "start": 19630653, "end": 19632484}, {"filename": "/locale/img/menue.png", "start": 19632484, "end": 19634078}, {"filename": "/locale/img/cue.png", "start": 19634078, "end": 19635665}, {"filename": "/queue_shadow.png", "start": 19635665, "end": 19637232}, {"filename": "/locale/img/pgup.png", "start": 19637232, "end": 19638711}, {"filename": "/locale/img/tab.png", "start": 19638711, "end": 19640145}, {"filename": "/tabletex_fB_128x128.png", "start": 19640145, "end": 19641548}, {"filename": "/locale/img/logo.png", "start": 19641548, "end": 19642951}, {"filename": "/locale/img/enter.png", "start": 19642951, "end": 19644328}, {"filename": "/locale/img/f10.png", "start": 19644328, "end": 19645670}, {"filename": "/locale/img/f6.png", "start": 19645670, "end": 19646952}, {"filename": "/locale/img/down1.png", "start": 19646952, "end": 19648230}, {"filename": "/locale/img/f9.png", "start": 19648230, "end": 19649504}, {"filename": "/locale/img/f8.png", "start": 19649504, "end": 19650778}, {"filename": "/locale/img/f3.png", "start": 19650778, "end": 19652042}, {"filename": "/locale/img/right.png", "start": 19652042, "end": 19653303}, {"filename": "/locale/img/left.png", "start": 19653303, "end": 19654559}, {"filename": "/locale/img/up1.png", "start": 19654559, "end": 19655813}, {"filename": "/locale/img/f2.png", "start": 19655813, "end": 19657048}, {"filename": "/locale/img/f5.png", "start": 19657048, "end": 19658270}, {"filename": "/locale/img/f4.png", "start": 19658270, "end": 19659463}, {"filename": "/locale/img/m.png", "start": 19659463, "end": 19660645}, {"filename": "/locale/img/s.png", "start": 19660645, "end": 19661817}, {"filename": "/blende.png", "start": 19661817, "end": 19662984}, {"filename": "/locale/img/b.png", "start": 19662984, "end": 19664142}, {"filename": "/locale/img/8.png", "start": 19664142, "end": 19665291}, {"filename": "/locale/img/f7.png", "start": 19665291, "end": 19666414}, {"filename": "/locale/img/6.png", "start": 19666414, "end": 19667537}, {"filename": "/locale/img/9.png", "start": 19667537, "end": 19668656}, {"filename": "/locale/img/v.png", "start": 19668656, "end": 19669772}, {"filename": "/locale/img/f1.png", "start": 19669772, "end": 19670886}, {"filename": "/locale/img/u.png", "start": 19670886, "end": 19671988}, {"filename": "/locale/img/0.png", "start": 19671988, "end": 19673084}, {"filename": "/locale/img/r.png", "start": 19673084, "end": 19674175}, {"filename": "/locale/img/3.png", "start": 19674175, "end": 19675261}, {"filename": "/locale/img/back.png", "start": 19675261, "end": 19676332}, {"filename": "/locale/img/next.png", "start": 19676332, "end": 19677400}, {"filename": "/locale/img/2.png", "start": 19677400, "end": 19678457}, {"filename": "/locale/img/e.png", "start": 19678457, "end": 19679509}, {"filename": "/locale/img/4.png", "start": 19679509, "end": 19680556}, {"filename": "/locale/img/5.png", "start": 19680556, "end": 19681601}, {"filename": "/locale/img/f.png", "start": 19681601, "end": 19682620}, {"filename": "/locale/img/7.png", "start": 19682620, "end": 19683637}, {"filename": "/locale/img/1.png", "start": 19683637, "end": 19684616}, {"filename": "/locale/img/l.png", "start": 19684616, "end": 19685546}, {"filename": "/music/music.txt", "start": 19685546, "end": 19686471}, {"filename": "/html/images/footer-bg.png", "start": 19686471, "end": 19687165}, {"filename": "/locale/css/help.css", "start": 19687165, "end": 19687795}, {"filename": "/locale/css/help1.css", "start": 19687795, "end": 19688424}, {"filename": "/html/tournament.xml", "start": 19688424, "end": 19689032}, {"filename": "/html/history.xml", "start": 19689032, "end": 19689548}, {"filename": "/html/images/content-bg.png", "start": 19689548, "end": 19689888}, {"filename": "/html/images/body-bg.png", "start": 19689888, "end": 19690224}, {"filename": "/html/images/sidebar-h3-bg.jpg", "start": 19690224, "end": 19690534}], "remote_package_size": 19690534, "package_uuid": "6cce8581-18dd-4f9d-a2a9-156f84702036"});

  })();
