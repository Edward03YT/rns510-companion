export const SAMPLE_VCDS_LOG = `Friday,23,October,2026,10:09:14:00009
VCDS -- Windows Based VAG/VAS Emulator Running on Windows 11 x64
VCDS Version: 22.3.1.4
Data version: 20220407 DS337.0
www.Ross-Tech.com

VIN: WVWZZZ1KZ*W******   License Plate: XX00XXX
Mileage: 283050km-175879mi   Repair Order: 1

Chassis Type: 1K-VW36 (1K0)
Scan: 01 02 03 08 09 10 15 16 17 19 25 2E 37 42 44 46 52 56 62 72
          77

01-Engine -- Status: OK 0000
02-Auto Trans -- Status: OK 0000
03-ABS Brakes -- Status: OK 0000
04-Steering Angle -- Status: OK 0000
08-Auto HVAC -- Status: Malfunction 0010
09-Cent. Elect. -- Status: Malfunction 0010
10-Park/Steer Assist -- Status: OK 0000
15-Airbags -- Status: OK 0000
16-Steering wheel -- Status: OK 0000
17-Instruments -- Status: OK 0000
19-CAN Gateway -- Status: Malfunction 0010
25-Immobilizer -- Status: OK 0000
2E-Media Player 3 -- Status: OK 0000
37-Navigation -- Status: Malfunction 1010
42-Door Elect, Driver -- Status: Malfunction 0010
44-Steering Assist -- Status: OK 0000
46-Central Conv. -- Status: OK 0000
52-Door Elect, Pass. -- Status: OK 0000
56-Radio -- Status: Malfunction 1010
62-Door, Rear Left -- Status: OK 0000
72-Door, Rear Right -- Status: OK 0000
77-Telephone -- Status: OK 0000

-------------------------------------------------------------------------------
Address 01: Engine        Labels: 03L-906-022-CBA.clb
   Part No SW: 03L 906 022 B    HW: 03L 906 022 B
   Component: R4 2.0l TDI G000AG  0000
   Revision: --H01---    Serial number: VWZCZ000000000
   Coding: 0000078
   Shop #: WSC 01324 785 00200
   VCID: 2A5BE7AF85FF60DF49-807E

No fault code found.
Readiness: 0 0 0 0 0 

-------------------------------------------------------------------------------
Address 02: Auto Trans        Labels: 02E-927-770.clb
   Part No SW: 02E 300 051 R    HW: 02E 927 770 AJ
   Component: GSG DSG AG6     440 1815
   Revision: 04440181    Serial number: 00000902260111
   Coding: 0000020
   Shop #: WSC 01324 785 00200
   VCID: 2643139F91E744BF6D-8072

No fault code found.

-------------------------------------------------------------------------------
Address 03: ABS Brakes        Labels: 1K0-907-379-MK60-EC1.clb
   Part No SW: 1K0 907 379 AD    HW: 1K0 907 379 AD
   Component: ESP MK60EC1   H35 0106
   Revision: 00H35001
   Coding: 113B400D092400FB881102E5901F00413400
   Shop #: WSC 01324 785 00200
   VCID: 74E795C7C7BB02EF03-8020

No fault code found.

-------------------------------------------------------------------------------
Address 08: Auto HVAC (J255)       Labels:| 5K0-907-044.clb
   Part No SW: 5K0 907 044 BD    HW: 5K0 907 044 BD
   Component: Climatronic   H14 0305
   Revision: 00001001
   Coding: 0000000002
   Shop #: WSC 01324 785 00200
   ASAM Dataset: EV_Climatronic A01006
   ROD: EV_ClimaAutoBasis_VW36.rod
   VCID: 71E99CE3A0AB1747EA-8024

1 Fault Found:
9481988 - Air Quality Sensor 
          B10AF 04 [009] - Internal System Fault
          Confirmed - Tested Since Memory Clear
             Freeze Frame:
                    Fault Status: 00000001
                    Fault Priority: 2
                    Fault Frequency: 1
                    Reset counter: 182
                    Mileage: 280368 km
                    Date: 2026.10.23
                    Time: 19:34:25

-------------------------------------------------------------------------------
Address 09: Cent. Elect. (J519)       Labels:. 1K0-937-087.clb
   Part No SW: 1K0 937 087 D    HW: 1K0 937 087 D
   Component: BCM PQ35 M    103 0537
   Revision: 00103053    Serial number: 00000001021485
   Coding: 40180A3B88251AC0400800803400012443550088736D8560648000200000
   Shop #: WSC 01324 785 00200
   VCID: 326B8FBFA5DF7CDFC9-8066

   Subsystem 1 - Part No: 1K1 955 119 E  Labels: 1KX-955-119.CLB
   Component: Wischer 18020  26  0512
   Coding: 009795

   Subsystem 2 - Part No: 1K0 955 559 AH  Labels: 1K0-955-559-AG.CLB
   Component: RLS 250209 05  0403
   Coding: 0730ED

3 Faults Found:
01520 - Rain and Light Recognition Sensor (G397) 
            008 - Implausible Signal - Intermittent
             Freeze Frame:
                    Fault Status: 00101000
                    Fault Priority: 2
                    Fault Frequency: 3
                    Reset counter: 254
                    Mileage: 280652 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 15:36:55

             Freeze Frame:
                        Term 15 On
                    Voltage: 13.80 V
                        ON
                        ON

01520 - Rain and Light Recognition Sensor (G397) 
            004 - No Signal/Communication - Intermittent
             Freeze Frame:
                    Fault Status: 00100100
                    Fault Priority: 2
                    Fault Frequency: 1
                    Reset counter: 254
                    Mileage: 280652 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 15:40:12

01134 - Alarm Horn (H12) 
            000 - -
             Freeze Frame:
                    Fault Status: 01100000
                    Fault Priority: 4
                    Fault Frequency: 1
                    Reset counter: 214
                    Mileage: 208431 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 09:22:15

-------------------------------------------------------------------------------
Address 10: Park/Steer Assist (J446)       Labels:. 1K0-919-475.clb
   Part No SW: 1K0 919 475     HW: 1K0 919 475 
   Component: PARKHILFE 4K  H07 0005
   Revision: --000001    Serial number: 00000000000000
   Coding: 000005
   Shop #: WSC 01324 785 00200
   VCID: 6EEB84FB697FA8BF29-803A

No fault code found.

-------------------------------------------------------------------------------
Address 15: Airbags (J234)       Labels:. 5K0-959-655.clb
   Part No SW: 5K0 959 655 C    HW: 5K0 959 655 C
   Component: AirbagVW10    019 0401
   Coding: 00003036
   Shop #: WSC 01324 785 00200
   ASAM Dataset: EV_AirbaVW10BPAVW360 A01008
   ROD: EV_AirbaVW10BPAVW360.rod
   VCID: 3B75A29B72153D979A-806E

No fault code found.

-------------------------------------------------------------------------------
Address 16: Steering wheel (J527)       Labels:. 1K0-953-549-CH.clb
   Part No SW: 1K0 953 549 CH    HW: 1K0 953 549 CH
   Component: Lenks.Modul   036 0070
   Revision: 00036000    Serial number: 20090225100085
   Coding: 0000032
   Shop #: WSC 01324 785 00200
   VCID: 79F985D330DBCF0752-802C

No fault code found.

-------------------------------------------------------------------------------
Address 17: Instruments (J285)       Labels:. 1K8-920-xxx-17.clb
   Part No SW: 1K0 920 874 A    HW: 1K0 920 874 A
   Component: KOMBI         H04 0110
   Coding: 110F00
   Shop #: WSC 01324 785 00200
   ASAM Dataset: EV_Kombi_UDS_VDD_RM09 A04040
   ROD: EV_Kombi_UDS_VDD_RM09_VW36.rod
   VCID: 2A5BE7AF85FF60DF49-807E

No fault code found.

-------------------------------------------------------------------------------
Address 19: CAN Gateway (J533)       Labels:. 7N0-907-530-V2.clb
   Part No SW: 7N0 907 530 AN    HW: 1K0 907 951 
   Component: J533  Gateway H56 1642
   Revision:   H56       Serial number: 180213F2000548
   Coding: 356002
   Shop #: WSC 01324 785 00200
   VCID: 7CF78DC7FF8B322F43-8028

3 Faults Found:
01300 - Control Module for Navigation with CD-Rom (J0506) 
            004 - No Signal/Communication - Intermittent
             Freeze Frame:
                    Fault Status: 00100100
                    Fault Priority: 2
                    Fault Frequency: 1
                    Reset counter: 254
                    Mileage: 282892 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 10:14:20

01304 - Radio 
            004 - No Signal/Communication - Intermittent
             Freeze Frame:
                    Fault Status: 00100100
                    Fault Priority: 2
                    Fault Frequency: 1
                    Reset counter: 254
                    Mileage: 282892 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 10:14:20

03272 - Control Module for Audio Interface 
            004 - No Signal/Communication - Intermittent
             Freeze Frame:
                    Fault Status: 00100100
                    Fault Priority: 2
                    Fault Frequency: 1
                    Reset counter: 254
                    Mileage: 282892 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 10:14:20

-------------------------------------------------------------------------------
Address 25: Immobilizer (J334)       Labels:. 5K0-920-xxx-25.clb
   Part No SW: 5K0 920 874 A    HW: 5K0 920 874 A
   Component: IMMO          H04 0110
   Shop #: WSC 00000 000 00000
   ASAM Dataset: EV_Immo_UDS_VDD_RM09 A03004
   ROD: EV_Immo_UDS_VDD_RM09_VW36.rod
   VCID: 2A5BE7AF85FF60DF49-807E

No fault code found.

-------------------------------------------------------------------------------
Address 2E: Media Player 3 (J650)       Labels:. 5N0-035-342.clb
   Part No SW: 5N0 035 342 E    HW: 5N0 035 342 E
   Component: MDI           H09 0240
   Revision: ----0001    Serial number: 00001015697394
   Coding: 010000
   Shop #: WSC 01324 785 00200
   VCID: 2B5DE0AB8AFA69D75E-807E

No fault code found.

-------------------------------------------------------------------------------
Address 37: Navigation (J0506)       Labels:. 1T0-035-680.clb
   Part No SW: 1T0 035 680 C    HW: 1T0 035 680 C
   Component: RNS-MID       H50 2840
   Revision: AB001001    Serial number: VWZ6Z7L9026007
   Coding: 04000402040000A000
   Shop #: WSC 05314 000 00000
   VCID: 2E53BBBF79174CFF6D-807A

2 Faults Found:
01523 - Microphone for Telephone (R38) 
            011 - Open Circuit - Intermittent
             Freeze Frame:
                    Fault Status: 00101011
                    Fault Priority: 5
                    Fault Frequency: 1
                    Reset counter: 254
                    Mileage: 282892 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 10:19:07

00446 - Function Limitation due to Under-Voltage 
            002 - Lower Limit Exceeded - Intermittent
             Freeze Frame:
                    Fault Status: 00100010
                    Fault Priority: 6
                    Fault Frequency: 1
                    Reset counter: 254
                    Mileage: 282892 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 10:32:45

-------------------------------------------------------------------------------
Address 42: Door Elect, Driver (J386)       Labels:. 1K0-959-701-MAX4.clb
   Part No SW: 1T0 959 701 D    HW: 1T0 959 701 D
   Component: Tuer-SG       009 2110
   Coding: 0000180
   Shop #: WSC 01324 785 00200
   VCID: 3E73AE8F69372CFFA1-806A

2 Faults Found:
00109 - Left Mirror Turn Signal Lamp (L131) 
            012 - Electrical Fault in Circuit
             Freeze Frame:
                    Fault Status: 01101100
                    Fault Priority: 2
                    Fault Frequency: 1
                    Reset counter: 220
                    Mileage: 282800 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 08:31:00

00131 - Door Handle Light / Mirror Light (Driver Side) 
            012 - Electrical Fault in Circuit - Intermittent
             Freeze Frame:
                    Fault Status: 00101100
                    Fault Priority: 2
                    Fault Frequency: 1
                    Reset counter: 220
                    Mileage: 282800 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 08:35:10

-------------------------------------------------------------------------------
Address 44: Steering Assist (J500)       Labels:. 1K0-909-144-GEN3.clb
   Part No: 1K0 909 144 J
   Component: EPS_ZFLS Kl. 70     3001
   Revision: 00H17000
   Shop #: WSC 00000 000 00000
   VCID: 326B8FBFA5DF7CDFC9-8066

No fault code found.

-------------------------------------------------------------------------------
Address 52: Door Elect, Pass. (J387)       Labels:. 1K0-959-702-MAX4.clb
   Part No SW: 1T0 959 702 D    HW: 1T0 959 702 D
   Component: Tuer-SG       009 2110
   Coding: 0000180
   Shop #: WSC 01324 785 00200
   VCID: 3F7DA38B6E3D25F7A6-806A

No fault code found.

-------------------------------------------------------------------------------
Address 56: Radio (J0506)       Labels:. 1T0-035-680.clb
   Part No SW: 1T0 035 680 C    HW: 1T0 035 680 C
   Component: RNS-MID       H50 2840
   Revision: AB001001    Serial number: VWZ6Z7L9026007
   Coding: 04000402040000A000
   Shop #: WSC 05314 000 00000
   VCID: 2E53BBBF79174CFF6D-807A

2 Faults Found:
01523 - Microphone for Telephone (R38) 
            011 - Open Circuit - Intermittent
             Freeze Frame:
                    Fault Status: 00101011
                    Fault Priority: 5
                    Fault Frequency: 1
                    Reset counter: 254
                    Mileage: 282892 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 10:19:07

00446 - Function Limitation due to Under-Voltage 
            002 - Lower Limit Exceeded - Intermittent
             Freeze Frame:
                    Fault Status: 00100010
                    Fault Priority: 6
                    Fault Frequency: 1
                    Reset counter: 254
                    Mileage: 282892 km
                    Time Indication: 0
                    Date: 2021.03.15
                    Time: 10:32:45

-------------------------------------------------------------------------------
Address 62: Door, Rear Left        Labels: 1K0-959-703.clb
   Part No SW: 1K0 959 703 K    HW: 1K0 959 703 K
   Component: Tuer-SG       006 1201
   Coding: 0000016
   Shop #: WSC 01324 785 00200
   VCID: 3979A49370A94F8782-806C

No fault code found.

-------------------------------------------------------------------------------
Address 72: Door, Rear Right        Labels: 1K0-959-704.clb
   Part No SW: 1K0 959 704 K    HW: 1K0 959 704 K
   Component: Tuer-SG       006 1201
   Coding: 0000016
   Shop #: WSC 01324 785 00200
   VCID: 3A7FA39F75AF449F8B-806E

No fault code found.

-------------------------------------------------------------------------------
Address 77: Telephone (J412)       Labels:. 7P6-035-730.clb
   Part No SW: 7P6 035 730 C    HW: 7P6 035 730 C
   Component: TELEPHONE     H05 0440
   Revision: 1B001001    Serial number: 00007669145618
   Coding: 0A00000000010101
   Shop #: WSC 01324 785 00200
   VCID: 326B8FBFA5DF7CDFC9-8066

No fault code found.

End-------------------------(Elapsed Time: 02:50)--------------------------`;
