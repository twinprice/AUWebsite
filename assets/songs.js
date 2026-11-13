/*
  SONGS WE PLAY
  -------------
  The site reads the song list from the band's Google Sheet when the link
  below is filled in. Edit the sheet and the site updates within about
  5 minutes. No HTML or code changes needed.

  Sheet setup (one time):
    1. Make a Google Sheet with these column headings in row 1:
         Title | Artist | Year | Show
       - Artist: use "Acoustic Underground" for our originals.
       - Year: optional.
       - Show: optional. Type "no" to hide a song without deleting it.
    2. File > Share > Publish to web. Pick the song tab, pick
       "Comma-separated values (.csv)", click Publish, copy the link.
    3. Paste the link between the quotes on the next line.
*/
window.AU_SONGS_SHEET = '';

/*
  BACKUP LIST
  -----------
  Used only when the sheet link above is empty or the sheet can't be reached.
  One song per line:   Title | Artist | Year
  - Use "Acoustic Underground" as the artist for our originals.
  - Lines starting with # are ignored.
  - Order does not matter. The site shows originals first, then sorts by title.
*/
window.AU_SONGS = `
# --- Originals ---
Pockets Are Full | Acoustic Underground |
The Bond | Acoustic Underground |
Lonely Astronaut | Acoustic Underground |
Life's the Joke | Acoustic Underground |
Robot Boy | Acoustic Underground |
Live It Up | Acoustic Underground |
Abby | Acoustic Underground |

# --- Covers ---
The Weight | The Band | 1968
Suite: Judy Blue Eyes | Crosby, Stills & Nash | 1969
Brain Damage | Pink Floyd | 1973
Eclipse | Pink Floyd | 1973
American Girl | Tom Petty | 1976
The Chain | Fleetwood Mac | 1977
Take the Long Way Home | Supertramp | 1979
In the Air Tonight | Phil Collins | 1981
Every Little Thing She Does Is Magic | The Police | 1981
Jack and Diane | John Cougar | 1982
Southern Cross | Crosby, Stills & Nash | 1982
Everybody Wants to Rule the World | Tears for Fears | 1985
In Your Eyes | Peter Gabriel | 1986
It's the End of the World as We Know It | R.E.M. | 1987
Lovesong | The Cure | 1989
Losing My Religion | R.E.M. | 1991
Wildflowers | Tom Petty | 1994
All for You | Sister Hazel | 1997
Take Me Out | Franz Ferdinand | 2004
Umbrella | Rihanna / Train | 2007
Lost in My Mind | The Head and the Heart | 2011
I Will Wait | Mumford & Sons | 2012
A Sky Full of Stars | Coldplay | 2014
Ain't No Man | The Avett Brothers | 2016
Cleopatra | The Lumineers | 2016
Colors | Black Pumas | 2019
Starting Over | Chris Stapleton | 2020
Stick Season | Noah Kahan | 2022

# --- Added 2026-11-13 from Winston's full list ---
24 Frames | Jason Isbell | 2015
Africa | Toto | 1982
Abbey Road 1 - You Never Give Me Your Money | The Beatles | 1969
Abbey Road 2 - Sun King | The Beatles | 1969
Abbey Road 3 - Mean Mr. Mustard | The Beatles | 1969
Abbey Road 4 - Polythene Pam | The Beatles | 1969
Abbey Road 5 - She Came In Through the Bathroom Window | The Beatles | 1969
Abbey Road 6 - Golden Slumbers | The Beatles | 1969
Abbey Road 7 - Carry That Weight | The Beatles | 1969
Abbey Road 8 - The End | The Beatles | 1969
Abbey Road 9 - Her Majesty | The Beatles | 1969
Blue | The Jayhawks | 1995
Burning in the Sun | Blue Merle | 2005
Cinnamon Girl | Neil Young | 1969
Dance the Night | Dua Lipa | 2023
Falling Slowly | Glen Hansard | 2007
Happy Xmas (War Is Over) | John Lennon | 1971
Harmony Hall | Vampire Weekend | 2019
Hate It Here | Wilco | 2007
Hey, Ma | Bon Iver | 2019
High and Dry | Radiohead | 1995
In My Place | Coldplay | 2002
June Hymn | The Decemberists | 2011
Later On | Fantastic Cat |
Loving Cup | The Rolling Stones | 1972
Man on the Moon | R.E.M. | 1992
The Night We Met | Lord Huron | 2015
Run Like Hell | Pink Floyd | 1979
Something's Always Wrong | Toad the Wet Sprocket | 1994
Suitcase Full of Sparks | Gregory Alan Isakov | 2013
That's All | Genesis | 1983
Trouble | Ray LaMontagne | 2004
Walking on the Moon | The Police | 1979
Windows Are Rolled Down | Amos Lee | 2008
`;
