 var keyword = 'project_cleaning';
    var city = '北京';
    (function(a) {
    var b = {weekText: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],daysCount: 10};
    a.mobiscroll.presets.datehour = function(p) {
        var v = a.extend({}, p.settings), x = a.extend(p.settings, b, v), t = a(this);
        var l = new Date();
        var o = [];
        var e = {label: "日期",keys: [],values: []};
        var w = {label: "时间",keys: [],values: []};
        var c = [];
        if(x.rowtype!=1){
            for (var k = 0; k < x.daysCount; k++) {
                var j = l.valueOf();
                j = j + k * 24 * 60 * 60 * 1000;
                j = new Date(j);
                var u = j.getFullYear();
                var g = j.getMonth() + 1;
                var r = j.getDate();
                var f = g + "月" + r + "日&nbsp;" + x.weekText[j.getDay()];
                if (g <= 9) {
                    g = "0" + g
                }
                if (r <= 9) {
                    r = "0" + r
                }
                var q = u + "-" + g + "-" + r;
                e.keys.push(q);
                if (k == 0) {
                    f = "今天"
                } else {
                    if (k == 1) {
                        f = "明天"
                    }
                }
                e.values.push(f)
            }
            c.push(e);
            if(x.rowtype!=2){//保姆类无时间、时长
                for (var n = 0; n <= 23; n++) {
                    if (n <= 9) {
                        n = "0" + n
                    }
                    w.keys.push(n + ":00",n+":30");
                }
                for(var i = 0; i<w.keys.length; i++){
                    w.values.push(w.keys[i])
                }      
                c.push(w);
            }
        }else{
            var timeArr=['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00'];
            timeArr.forEach(function(item){
                e.keys.push(item);
                e.values.push(item);
            })
            c.push(e);
        }
        if(x.newColumn===1&&x.rowtype!=2){
            var hours = {label: "服务时长",keys: [],values: []};
            for (var n = 2; n <= 10; n++) {
                hours.keys.push(' '+n+'小时');
            }
            for(var i = 0; i<hours.keys.length; i++){
                hours.values.push(hours.keys[i]);
            }
            c.push(hours);   
        }
        o.push(c);
        return {wheels: o,parseValue: function(I, D) {
                console.info("parseValue:" + I);
                var B = new RegExp(/[0-9]{4}-[0-9]{2}-[0-9]{2}[" "]{1}[0-9]{2}[:]{1}[0-9]{2}/);
                if (I == null || I == "" || !B.test(I)) {
                    var H = new Date();
                    var C = H.getHours();
                    var s = H.getMinutes();
                    if (C >= 0 && C < 8 || (C == 8 && s == 0)) {
                        C = 10
                    } else {
                        if (C >= 8 && C < 17 || (C == 17 && s == 0)) {
                            if (s == 0) {
                                C = C + 2
                            } else {
                                C = C + 3
                            }
                        } else {
                            H = H.valueOf();
                            H = H + 24 * 60 * 60 * 1000;
                            H = new Date(H);
                            C = 10
                        }
                    }
                    if (C > 19) {
                        C = 19
                    }
                    var G = H.getFullYear();
                    var z = H.getMonth() + 1;
                    var F = H.getDate();
                    z = z <= 9 ? "0" + z : z;
                    F = F <= 9 ? "0" + F : F;
                    C = C <= 9 ? "0" + C : C;
                    I = G + "-" + z + "-" + F + " " + C + ":00";
                    console.info("defaultValue:" + I)
                }
                var h = I.split(" "), E = [], A = 0, J;
                a.each(D.settings.wheels, function(i, d) {
                    a.each(d, function(y, m) {
                        m = m.values ? m : convert(m);
                        J = m.keys || m.values;
                        if (a.inArray(h[A], J) !== -1) {
                            E.push(h[A])
                        } else {
                            E.push(J[0])
                        }
                        A++
                    })
                });
                return E
            },validate: function(C, I) {
                if(x.rowtype!=1){
                    var N = new Date();
                    var s = N.getHours();
                    var h = N.getMinutes();
                    var theHours = N.getHours();
                    var theMinutes = N.getMinutes();

                    var todayStart = new Date();
                    todayStart.setHours(8);//8点开始可以预约
                    todayStart.setMinutes(0);
                    todayStart.setSeconds(0);
                    todayStart.setMilliseconds(0);
                    var todayEnd = new Date(todayStart.getTime()+10*60*60*1000);//18点结束预约
                    if(x.rowtype==3){
                        if(todayEnd.getTime()-N.getTime()<5*60*60*1000){//当前时间已经超过 16:00
                            N = new Date(todayEnd.getTime()+24*60*60*1000+1);//第二天凌晨0点加1ms
                            s = 8;
                        }else{
                            var tmpDate = new Date(N.getTime()+24*60*60*1000);
                            var tmpHours = tmpDate.getHours();
                            s = tmpHours < 8 ? 8:(tmpDate.getMinutes() < 30 ? tmpHours : tmpHours+1);
                        }
                    }else{
                        if(todayEnd.getTime()-N.getTime()<2*60*60*1000){//当前时间已经超过 16:00
                            N = new Date(todayEnd.getTime()+6*60*60*1000+1);//第二天凌晨0点加1ms
                            s = 8;
                        }else{
                            var tmpDate = new Date(N.getTime()+2*60*60*1000);
                            var tmpHours = tmpDate.getHours();

                            s = tmpHours < 8 ? 8:(tmpDate.getMinutes() < 30 ? tmpHours : tmpHours+1);
                        }
                    }
                    var tomorrowStart = new Date(todayStart.getTime()+24*60*60*1000);

                    
                    /*
                    if (s >= 0 && s < 8 || (s == 8 && h == 0)) {                    
                        if(s >= 0 && s < 8 && keyword == "project_cleaning" && city == "北京"){
                            console.log("00:00 ~ 07:59");
                            s = 12;
                        }else{
                            s = 10
                        }
                    } else {
                        if (s >= 8 && s < 17 || (s == 17 && h == 0)) {
                            if(keyword == "project_cleaning" && city == "北京"){
                                if((s + 4) > 18 || ((s + 4) == 18 && h > 0)){
                                    console.log(s+"1")
                                    N = N.valueOf();
                                    N = N + 24 * 60 * 60 * 1000;
                                    N = new Date(N);
                                    if((s + 4) >= 20){
                                        console.log("00:00 ~ 07:59");
                                        s = 12;
                                    }else{
                                        s = 8;
                                    }
                                }else{
                                    s = s + 4;
                                }
                            }else{
                                if (h == 0) {
                                    s = s + 2
                                } else {
                                    s = s + 2
                                }
                            }
                        } else {
                            N = N.valueOf();
                            N = N + 24 * 60 * 60 * 1000;
                            N = new Date(N);
                            if(keyword == "project_cleaning" && city == "北京"){
                                 console.log("16:00 ~ 23:59++++");
                                s = 12;
                            }else{
                                s = 8
                            }
                        }
                    }
                    if (s > 19) {
                        console.log(s+",")
                        s = 19
                    }*/
                    var B = N.getFullYear();
                    var G = N.getMonth() + 1;
                    var K = N.getDate();
                    G = G <= 9 ? "0" + G : G;
                    K = K <= 9 ? "0" + K : K;
                    s = s <= 9 ? "0" + s : s;
                    var E = B + "-" + G + "-" + K;
                    var L = a(".dw-ul", C).eq(0);
                    var D = a(".dw-ul", C).eq(1);
                    var O = a(".dw-li", L).index(a('.dw-li[data-val="' + E + '"]', L)), M = a(".dw-li", L).size();
                    a(".dw-li", L).removeClass("dw-v").slice(O, M).addClass("dw-v");
                    if(x.rowtype==3){
                        var A = s + ":00", z = "13:00";//控制结束时间点
                    }else{
                        var A = s + ":00", z = "18:00";
                    }
                    var J = p.temp;
                    if (J[0] != E) {
                        A = "08:00"
                    } else {
                        if (N.getHours() > 20 || (N.getHours() == 20 && h > 0)) {
                            if(keyword == "project_cleaning" && city == "北京"){
                                A = "12:00";
                            }else{
                                A = "10:00";
                            }
                        }
                    }
                    var H = a(".dw-li", D).index(a('.dw-li[data-val="' + A + '"]', D)), F = a(".dw-li", D).index(a('.dw-li[data-val="' + z + '"]', D));
                    a(".dw-li", D).removeClass("dw-v").slice(H, F + 1).addClass("dw-v")
                }
            }}
    };
    a.mobiscroll.presetShort("datehour")
})(jQuery);