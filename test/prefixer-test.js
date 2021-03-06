import { expect } from 'chai'
import Prefixer from '../lib/Prefixer'

const MSIE9 = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 7.1; Trident/5.0)'
const MSIE10 = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)'
const MSIE11 = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'

const Android4_4_4 = 'Mozilla/5.0 (Linux; Android 4.4.4; One Build/KTU84L.H4) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/33.0.0.0 Mobile Safari/537.36'
const Chrome14 = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.812.0 Safari/535.1'
const Chrome45 = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36'
const Chrome49 = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2454.85 Safari/537.36'


describe('Prefixing a property', () => {
  it('should only add required prefixes', () => {
    let input = {appearance: 'test', transition: 'test'}
    let input2 = {appearance: 'test', transition: 'test'}
    let prefixed = {WebkitAppearance: 'test', transition: 'test'}
    expect(new Prefixer(Chrome45).prefix(input)).to.eql(prefixed)
    expect(new Prefixer(Chrome49).prefix(input2)).to.eql(input2)
  })
})

describe('Prefixing 2D transforms', () => {
  let input = {transform: 'rotate(30deg)'}
  let prefixed = {msTransform: 'rotate(30deg)'}

  it('should be prefixed on IE 9', () => {
    expect(new Prefixer(MSIE9).prefix(input)).to.eql(prefixed)
  })

  it('should not be prefixed on IE 10', () => {
    expect(new Prefixer(MSIE10).prefix(input)).to.eql(input)
  })
})

describe('Running on android < 4.4', () => {
  it('should use the osversion to check for required props', () => {
    let andPrefixer = new Prefixer(Android4_4_4)
    expect(andPrefixer._browserInfo.version).to.eql(andPrefixer._browserInfo.osversion)
    expect(andPrefixer._browserInfo.version).to.eql(4.4)

    let transform = {transform: 'rotate(40deg)'}
    let output = {WebkitTransform: 'rotate(40deg)'}
    expect(new Prefixer(Android4_4_4).prefix(transform)).to.eql(output)
  })
})


describe('Resolving plugins', () => {
  it('should resolve properties', () => {
    let input = {alignItems: 'center'}
    let output = {msFlexAlign: 'center'}
    expect(new Prefixer(MSIE10).prefix(input)).to.eql(output)
  })
  it('should resolve values', () => {
    let input = {display: 'flex'}
    let output = {display: '-webkit-box'}
    expect(new Prefixer(Chrome14).prefix(input)).to.eql(output)
  })

  it('should resolve alternatives', () => {
    let input = {justifyContent: 'space-between'}
    let output = {msFlexPack: 'justify'}
    expect(new Prefixer(MSIE10).prefix(input)).to.eql(output)
  })
})

describe('Using an invalid userAgent', () => {
  it('should return the exact input', () => {
    const input = {appearance: 'test', transition: 'test'}
    expect(new Prefixer('bad userAgent').prefix(input)).to.eql(input)
  })
})

describe('Prefixing keyframes', () => {
  it('should return the correct keyframes string', () => {
    expect(new Prefixer(Chrome14).prefixedKeyframes).to.eql('-webkit-keyframes')
    expect(new Prefixer(Chrome49).prefixedKeyframes).to.eql('keyframes')
  })
})

describe('Combine all supported browser prefixes', () => {
  it('should resolve common required vendor properties', () => {
    let input = {
      alignItems: 'center',
      height: '100px',
      width: '200px'
    }
    let output = {
      MozAlignItems: 'center',
      WebkitAlignItems: 'center',
      msAlignItems: 'center',
      alignItems: 'center',
      height: '100px',
      width: '200px'
    }
    expect(Prefixer.prefixAll(input)).to.eql(output)
  })
})
