1 BEGIN PGM W5270NS01060B9 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMU 85 monoBLOCK
7 ; DATE   	  : 22.10.2025
8 ; TIME  	  : 13:50
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ;created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ---------------
15 ; T1635493907 | GUH-4630-MF_M8_H63PL100-MF / DM=8 CR=0 TL=161
16 ; ---- TOOLLIST END ----------------
17 ;
18 ; --- BLOCK FORM -------------------
19 BLK FORM 0.1 Z X-187 Y-55.5 Z-50.6
20 BLK FORM 0.2 X187 Y55.5 Z0.6
21 ; ----------------------------------
22 ;
23 ; ----------------------------------
24 CYCL DEF 392 ATC~
   Q240=0 ;TUNING MODE~
   Q241=1 ;WEIGHT MODE
25 ; ----------------------------------
26 M127 ; SHORTER PATH TRAVERSE OF ROTARY AXES OFF
27 FUNCTION RESET TCPM
28 CALL LBL 1 ; RESET WORKING PLANE
29 ; --- SAFEPOSITION TOOL CALL -------
30 L Z0 R0 FMAX M91
31 L X0 R0 FMAX M91
32 L Y-425 R0 FMAX M91
33 ; ----------------------------------
34 L A0 R0 FMAX
35 ; ----------------------------------
36 * - TOOL: T1635493907 | GUH-4630-MF_M8_H63PL100-MF / DM=8 CR=0 TL=161
37 TOOL CALL "MH08000000530275" Z S239 DL+0 DR+0
38 ; ----------------------------------
39 *   - JOB: 12: M8-menetfúrás-CYCL207
40 ; ----------------------------------
41 CALL LBL 1 ; RESET WORKING PLANE
42 FN 0:Q3=299 ; Z FEED RATE
43 ; --- SAFEPOSITION -----------------
44 L Z0 R0 FMAX M91
45 L X0 R0 FMAX M91
46 L Y-425 R0 FMAX M91
47 ; ----------------------------------
48 ; ----------------------------------
49 ; A0 C0
50 ; ----------------------------------
51 CYCL DEF 7.0 DATUM SHIFT
52 CYCL DEF 7.1 X0
53 CYCL DEF 7.2 Y0
54 CYCL DEF 7.3 Z0
55 PLANE SPATIAL SPA0 SPB0 SPC0 STAY SEQ+ TABLE ROT
56 L A+Q120 C+Q122 R0 FMAX M126
57 L X173.5 Y20 R0 F MAX M3
58 M8
59 L Z50 R0 F MAX
60 CYCL DEF 207 RIGID TAPPING NEW~
   Q200=3 ;SET-UP CLEARANCE~
   Q201=-18.5 ;DEPTH~
   Q239=+1.25 ;THREAD PITCH~
   Q203=0 ;SURFACE COORDINATE~
   Q204=50 ;2ND SET-UP CLEARANCE
61 L X173.5 Y20 R0 F MAX M99
62 L X-160.5 Y-20 R0 F MAX M99
63 M9
64 M5
65 CALL LBL 1 ; RESET WORKING PLANE
66 ; --- SAFEPOSITION END -------------
67 L Z0 R0 FMAX M91
68 L X0 R0 FMAX M91
69 L Y-425 R0 FMAX M91
70 ; ----------------------------------
71 ; --- SAFEPOSITION END -------------
72 L Z0 R0 FMAX M91
73 L X0 R0 FMAX M91
74 L Y0 R0 FMAX M91
75 ; ----------------------------------
/76 M30
77 * --- LBL BEGIN --------------------
78 LBL 1 ; RESET WORKING PLANE
79 CYCL DEF 7.0 DATUM SHIFT
80 CYCL DEF 7.1 X0
81 CYCL DEF 7.2 Y0
82 CYCL DEF 7.3 Z0
83 PLANE RESET STAY
84 LBL 0
85 ; ----------------------------------
86 LBL "CuttingEdgesCheck"
87 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
88 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
89 LBL 0
90 ; ----------------------------------
91 LBL "CuttingEdges1"
92 FN 0: Q1901=4
93 LBL 0
94 ; ----------------------------------
95 LBL "CuttingEdges2"
96 FN 0: Q1901=3
97 LBL 0
98 ; ----------------------------------
99 END PGM W5270NS01060B9 MM
